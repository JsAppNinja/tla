<?php
namespace frontend\modules\v1\controllers;

use common\models\Images;
use common\models\UploadExamForm;
use common\models\User;
use common\models\Question as OriginQuestion;
use common\models\SubjectOrigin;
use frontend\components\Helpers\MixPanelHelper;
use frontend\modules\v1\models\Question;
use frontend\modules\v1\models\Quize;
use yii\imagine\Image;
use Yii;
use yii\rest\ActiveController;
use yii\data\ActiveDataProvider;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;
use yii\web\UploadedFile;

class QuestionController extends ActiveController
{
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['create', 'index', 'delete', 'list', 'all', 'import', 'images', 'update'],
                'rules' => [
                    [
                        'actions' => ['create', 'index', 'delete', 'list', 'all', 'import', 'images', 'update'],
                        'allow' => true,
                        'roles' => ['teacher', 'admin', 'student', 'superadmin'],
                    ],
                ],
            ],
        ]);
    }

    private $user;
    public $modelClass = 'frontend\modules\v1\models\Question';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'update' => ['PUT', 'POST'],
            'list' => ['GET'],
            'images' => ['GET'],
            'all' => ['GET'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actionImport()
    {
        $uploadExam = new UploadExamForm();

        if (Yii::$app->request->isPost) {
            $uploadExam->subject_id = (int)Yii::$app->request->Post('subject_id', '');
            $uploadExam->examFile = UploadedFile::getInstance($uploadExam, 'examFile');
            if ($uploadExam->validate()) {
                if ($result = $uploadExam->createExam(Yii::$app->user->identity->getId())) {
                    return $result;
                } else {
                    return $result;
                }
            } else {
                return $uploadExam;
            }
        }
    }

    public function actionImages($question_id)
    {
        return OriginQuestion::findOne($question_id)->images;
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
        $model = new Question();
        $provider = new ActiveDataProvider([
            'query' => $model->find()->where(['user_id' => $this->user->id])
        ]);
        return $provider;
    }

    public function actionUpdate($id)
    {
        $model = Question::findOne(['id' => $id]);

        if (!$model) {
            throw new NotFoundHttpException;
        } else {
            $requestData = Yii::$app->getRequest()->getBodyParams();
            $requestData['question']['section_id'] = $requestData['question']['section_id'] != "null"?$requestData['question']['section_id']:null;
            $model->load($requestData['question'], '');

            $model->imageFiles = UploadedFile::getInstances($model, 'imageFiles');
            $model->oldImages = isset($requestData['oldImages'])?$requestData['oldImages']: [];

            if ($model->save()) {
                $quiz = $model->quiz;
                $quiz->type = $quiz->checkType();
                $quiz->save();

                return $model;
            } else {
                throw new \yii\web\HttpException(500, 'Internal server error');
            }
        }
    }

    public function actionList($quiz_id)
    {
        $questions = Question::find()->where(['quize_id' => $quiz_id, 'section_id' => null])->all();
        return $questions;
    }

    public function actionCreate()
    {
        $model = new Question();
        $requestData = Yii::$app->getRequest()->getBodyParams();
        $requestData['question']['topic_id'] = $requestData['question']['topic_id']?$requestData['question']['topic_id']:null;
        $requestData['question']['subtopic_id'] = $requestData['question']['subtopic_id']?$requestData['question']['subtopic_id']:null;
        $requestData['question']['section_id'] = $requestData['question']['section_id']?$requestData['question']['section_id']:null;
        $requestData['question']['essay'] = (int)$requestData['question']['essay'];
        $model->load($requestData['question'], '');

        $model->imageFiles = UploadedFile::getInstances($model, 'imageFiles');

        if (!$model->save()) {
            throw new \yii\web\HttpException(500, 'Internal server error');
        } else {
            $mp = new MixPanelHelper(Yii::$app->user->identity);
            $mp->track('Create question');

            $quiz = $model->quiz;
            $quiz->type = $quiz->checkType();
            $quiz->save();

            return $model;
        }
    }

    public function actionDelete($id)
    {
        $model = Question::findOne(['id' => $id]);
        if (!$model) {
            throw new NotFoundHttpException;
        }
        if ($model->delete() === false) {
            throw new HttpException(500, 'Internal Server Error');
        }

        $quiz = $model->quiz;
        $quiz->type = $quiz->checkType();
        $quiz->save();

    }

}