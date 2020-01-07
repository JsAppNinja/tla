<?php
namespace frontend\modules\v1\controllers;

use common\models\Answer;
use common\models\SubjectOrigin;
use frontend\modules\v1\models\Quize;
use Yii;
use yii\rest\ActiveController;
use yii\data\ActiveDataProvider;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;

class AnswerController extends ActiveController
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
    public $modelClass = 'frontend\modules\v1\models\Answer';

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

    public function actionList($id)
    {
        $answers = Answer::find()->where(['question_id' => $id])->all();
        return $answers;
    }

    public function actionAll()
    {
        $list = SubjectOrigin::find()->all();
        return $list;
    }

    public function actionCreate()
    {
        $answers = Yii::$app->getRequest()->getBodyParams();
        foreach($answers as $answer) {
            $model = new Answer();
            $model->load($answer, '');
            if (!$model->save()) {
                throw new \yii\web\HttpException(500, 'Internal server error');
            }
        }
    }

    public function actionUpdate($id)
    {
        $answerModel = Answer::findAll(['question_id' => $id]);
        foreach ($answerModel as $answer) {
            $answer->delete();
        }
        $answers = Yii::$app->getRequest()->getBodyParams();
        foreach($answers as $answer) {
            $model = new Answer();
            $model->load($answer, '');
            if (!$model->save()) {
                throw new \yii\web\HttpException(500, 'Internal server error');
            }
        }
    }

    public function actionDelete($id)
    {
        $model = Quize::findOne(['id' => $id]);
        if (!$model) {
            throw new NotFoundHttpException;
        } elseif ($model->delete() === false) {
            throw new HttpException(500, 'Internal Server Error');
        }
    }

}