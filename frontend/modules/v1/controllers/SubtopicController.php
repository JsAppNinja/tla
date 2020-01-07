<?php
namespace frontend\modules\v1\controllers;

use common\models\Subtopic;
use common\models\SubjectOrigin;
use frontend\modules\v1\models\Quize;
use Yii;
use yii\rest\ActiveController;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;

class SubtopicController extends ActiveController
{
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['create', 'index', 'delete', 'list', 'all', 'update'],
                'rules' => [
                    [
                        'actions' => ['create', 'index', 'delete', 'list', 'all', 'update'],
                        'allow' => true,
                        'roles' => ['teacher', 'admin', 'student', 'superadmin'],
                    ],
                ],
            ],
        ]);
    }

    private $user;
    public $modelClass = 'frontend\modules\v1\models\Subtopic';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'update' => ['PUT'],
            'delete' => ['DELETE'],
            'create' => ['POST'],
            'list' => ['GET'],
            'all' => ['GET'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update']);
        return $actions;
    }

    public function actionAll($id)
    {
        $subtopic = Subtopic::find()->where(['topic_id' => $id])->all();
        return $subtopic;
    }

    public function actionList()
    {
        $list = SubjectOrigin::find()->all();
        return $list;
    }

    public function actionCreate()
    {
        $subtopic = new Subtopic();
        $subtopic->load(Yii::$app->getRequest()->getBodyParams(), '');
        if (!$subtopic->save()) {
            throw new \yii\web\HttpException(500, 'Internal server error');
        }

        return $subtopic;
    }

    public function actionDelete($id)
    {
        $model = Subtopic::findOne(['id' => $id]);
        if (!$model) {
            throw new NotFoundHttpException;
        } elseif ($model->delete() === false) {
            throw new HttpException(500, 'Internal Server Error');
        }
    }

    public function actionUpdate($id)
    {
        $subtopic = Subtopic::findOne(['id' => $id]);
        $subtopic->load(Yii::$app->getRequest()->getBodyParams(), '');
        if (!$subtopic->save()) {
            throw new \yii\web\HttpException(500, 'Internal server error');
        }

        return $subtopic;
    }

}