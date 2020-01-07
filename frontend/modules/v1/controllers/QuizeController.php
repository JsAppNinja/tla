<?php
namespace frontend\modules\v1\controllers;

use common\models\Quizpractice;
use common\models\User;
use common\models\SubjectOrigin;
use Faker\Provider\tr_TR\DateTime;
use frontend\components\Helpers\MixPanelHelper;
use frontend\modules\v1\models\Quize;
use frontend\modules\v1\models\Tutor;
use Yii;
use yii\rest\ActiveController;
use yii\data\ActiveDataProvider;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;

class QuizeController extends ActiveController
{
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::className(),
                'except' => ['all'],
                'only' => ['create', 'index', 'delete', 'list', 'all'],
                'rules' => [
                    [
                        'actions' => ['create', 'index', 'delete', 'list'],
                        'allow' => true,
                        'roles' => ['teacher', 'admin', 'student', 'superadmin'],
                    ],
                    [
                        'actions' => ['list'],
                        'allow' => true,
                        'roles' => ['student', 'admin', 'student'],
                    ],
                ],
            ],
        ]);
    }

    private $user;
    public $modelClass = 'frontend\modules\v1\models\Quize';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'delete' => ['DELETE'],
            'create' => ['POST'],
            'list' => ['GET'],
            'all' => ['GET'],
            'update' => ['PUT'],
            'save-order' => ['POST'],
            'get-tutors-quizzes' => ['GET'],
            'preview-quiz' => ['GET']
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update']);
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];
        return $actions;
    }

    public function prepareDataProvider()
    {
        $model = new Subject();
        $provider = new ActiveDataProvider([
            'query' => $model->find()->where(['user_id' => $this->user->id])
        ]);
        return $provider;
    }

    public function actionAll($subject_id)
    {
        if(isset($this->user) && $this->user->isAdmin()) {
            return Quize::find()->where(['subject_id' => $subject_id, 'delete_time' => null])->orderBy('sort')->all();
        }
        return Quize::find()->where(['subject_id' => $subject_id, 'delete_time' => null, 'active'=>1])->orderBy('sort')->all();
    }

    public function actionGetTutorsQuizzes() {
        $request = Yii::$app->request->getQueryParams();
        return Quize::find()->where(['lesson_id' => $request['lesson_id'], 'subject_id' => $request['subject_id'] ,'delete_time' => null])->orderBy('sort')->all();
    }

    public function actionSaveOrder()
    {
        $request = Yii::$app->request->getBodyParams();
        foreach ($request as $id => $quiz) {
            $item = Quize::findOne($quiz['id']);
            $item->sort = $quiz['order'];
            $item->save();
        }

        return true;
    }

    public function actionList()
    {
        $quizzes = Quize::find()->where(['delete_time' => null])->all();
        return $quizzes;
    }

    public function actionEdit($quiz_id)
    {
        $quiz = Quize::findOne(['id' => $quiz_id]);
        return $quiz;
    }

    public function actionCreate()
    {
        $model = new Quize();
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        if (!$model->save()) {
            throw new \yii\web\HttpException(500, 'Internal server error');
        }

        $mp = new MixPanelHelper(Yii::$app->user->identity);
        $mp->track('Create quiz');

        return $model;
    }

    public function actionDelete($id)
    {
        $model = Quize::findOne(['id' => $id]);
        $model->delete();

        return true;
    }


    /**
     * @param $id
     * @return null|static
     * @throws HttpException
     * @throws NotFoundHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionUpdate($id)
    {
        /**
         * @var $model \frontend\modules\v1\models\Quize
         */

        $model = Quize::findOne(['id' => $id]);
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        if (!$model->save()) {
            throw new HttpException(500, 'Internal Server Error');
        }
        return $model;
    }

    public function actionPreviewQuiz($id) {
        return Quizpractice::getQuestionCollection($id);
    }
}