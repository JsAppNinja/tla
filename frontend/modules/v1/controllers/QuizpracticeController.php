<?php
namespace frontend\modules\v1\controllers;

use common\models\Answer;
use common\models\Images;
use common\models\Quize;
use common\models\User;
use common\presenters\PracticeExam\FinishedQuizzes;
use frontend\modules\v1\models\Examtype;
use frontend\modules\v1\models\Question;
use frontend\modules\v1\models\Quizpractice;
use stdClass;
use Yii;
use yii\base\Exception;
use yii\rest\ActiveController;
use yii\data\ActiveDataProvider;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;

class QuizpracticeController extends ActiveController
{
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::className(),
                'except' => ['viewall'],
                'only' => ['create', 'index', 'update', 'delete', 'show'],
                'rules' => [
                    [
                        'actions' => ['create', 'index', 'update', 'delete', 'show'],
                        'allow' => true,
                        'roles' => ['teacher', 'admin', 'student', 'superadmin'],
                    ],
                ],
            ],
        ]);
    }

    private $user;
    public $modelClass = 'frontend\modules\v1\models\Quizpractice';

    public function verbs()
    {
        $verbs = [
            'selectanswer' => ['POST'],
            'essaychange' => ['POST'],
            'getquestions' => ['POST'],
            'viewall' => ['GET'],
            'get-finished' => ['GET'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['view']);
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];
        return $actions;
    }

    public function actionSelectanswer()
    {
        $result = Yii::$app->getRequest()->getBodyParams();

        $quizpractice = Quizpractice::findOne(['id' => $result['quizpractice_id']]);

        if (!$quizpractice->selectAnswer($result['question_id'], $result['answer_id'])) {
            throw new \yii\web\HttpException(500, 'Internal server error');
        }
        return $quizpractice->answers;
    }

    public function actionEssaychange()
    {
        $result = Yii::$app->getRequest()->getBodyParams();
        $quizpractice = Quizpractice::findOne(['id' => $result['quizpractice_id']]);
        if (!$quizpractice->essayChange($result)) {
            throw new \yii\web\HttpException(500, 'Internal server error');
        }
        return $quizpractice->answers;
    }

    public function actionViewall($id)
    {
        $quiz = Quize::findOne($id);
        $object = Quizpractice::getQuestionCollection($id, null, null, '', false, null);
        $object->name = $quiz->name;
        return $object;
    }

    public function actionView($id)
    {
        $practice = Quizpractice::findOne(['id' => $id]);
        $questions = $practice->getQuestions();
        return $questions;
    }

    public function actionGetquestions($quizpractice_id)
    {
        return $quizpractice_id;
    }

    public function actionCreate()
    {

    }

    public function actionDelete($id)
    {

    }

    public function actionUpdate($id)
    {

    }

    public function actionGetFinished()
    {
        if(User::isStudent()) {
            return FinishedQuizzes::find()->where(['student_id' => Yii::$app->user->identity->id, 'status' => Quizpractice::FINISHED])->all();
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

}