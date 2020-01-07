<?php
namespace frontend\modules\v1\controllers;

use common\models\SubjectOrigin;
use common\models\User;
use frontend\components\Helpers\MixPanelHelper;
use frontend\modules\v1\models\Examtype;
use frontend\modules\v1\models\Subject;
use stdClass;
use Yii;
use yii\rest\ActiveController;
use yii\data\ActiveDataProvider;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;

class ExamtypeController extends ActiveController
{
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::className(),
                'except' => ['allfree'],
                'only' => ['create', 'index', 'update', 'delete', 'show', 'checkfree', 'allfree'],
                'rules' => [
                    [
                        'actions' => ['create', 'index', 'update', 'delete', 'show', 'checkfree'],
                        'allow' => true,
                        'roles' => ['teacher', 'admin', 'student', 'superadmin'],
                    ],
                ],
            ],
        ]);
    }

    private $user;
    public $modelClass = 'frontend\modules\v1\models\Examtype';

    public function verbs()
    {
        $verbs = [
            'checkfree' => ['POST'],
            'allfree' => ['GET'],
            'change-state' => ['PUT'],
            'save-order' => ['POST']
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actionSaveOrder()
    {
        $request = Yii::$app->request->getBodyParams();
        foreach ($request as $id => $exam) {
            $item = Examtype::findOne($exam['id']);
            $item->sort = $exam['order'];
            $item->save();
        }

        return true;
    }

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['index']);
        return $actions;
    }

    public function actionIndex()
    {
        $model = Examtype::find();
        if (User::isTeacher()) {
            $model->where(['user_id' => $this->user->id]);
            $result['type'] = $this->user->user_type;
        }
        if(User::isStudent()) {
            $model->where(['type'=>2]);
        }
        if(User::isAdmin()) {
            $model->where(['type'=>2]);
            $result['type'] = $this->user->user_type;
        }
        $result['data'] = $model->orderBy('sort')->all();

        return $result;
    }

    public function actionAllfree()
    {
        return Examtype::find()->where(['free'=>1, 'type'=>2])->orderBy('sort')->all();
    }

    public function actionCheckfree($id)
    {
        $model = Examtype::findOne($id);
        $model->free = !$model->free;
        $model->save();
    }

    public function actionCreate()
    {
        $model = new Examtype();
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        $model->user_id = $this->user->id;
        if(User::isAdmin()) {
            $model->type = 2;
        }
        if ($model->save()) {
            $mp = new MixPanelHelper(Yii::$app->user->identity);
            $mp->track('Create grade level');
            return $model;
        } else {
            throw new \yii\web\HttpException(500, 'Internal server error');
        }
    }

    public function actionDelete($id)
    {
        if($this->user->isAdmin()) {
            $model = Examtype::findOne(['id' => $id]);
        } else {
            $model = Examtype::findOne(['id' => $id, 'user_id' => $this->user->id]);
        }
        if (!$model) {
            throw new NotFoundHttpException;
        } elseif ($model->delete() === false) {
            throw new HttpException(500, 'Internal Server Error');
        }
    }

    public function actionUpdate($id)
    {
        $model = Examtype::findOne(['id' => $id, 'user_id' => $this->user->id]);
        if (!$model) {
            throw new NotFoundHttpException;
        } else {
            $model->load(Yii::$app->getRequest()->getBodyParams(), '');
            if ($model->save()) {
                return $model;
            } else {
                throw new \yii\web\HttpException(500, 'Internal server error');
            }
        }
    }

    public function prepareDataProvider()
    {
        $model = new Examtype();
        $provider = new ActiveDataProvider([
            'query' => $model->find()->where(['user_id' => $this->user->id])
        ]);
        return $provider;
    }

    public function actionChangeState($id)
    {
        $request = Yii::$app->request->getBodyParams();
        $exam = Examtype::findOne(['id' => $id, 'user_id' => $this->user->id]);
        $exam->active = $request['active'];
        return $exam->save();
    }
}