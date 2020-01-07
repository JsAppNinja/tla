<?php
namespace frontend\modules\v1\controllers;

use common\models\AdminVideo;
use common\models\Tutor;
use common\models\TutorSubject;
use common\models\User;
use common\models\SubjectOrigin;
use frontend\modules\v1\models\Subject;
use stdClass;
use Yii;
use yii\rest\ActiveController;
use yii\data\ActiveDataProvider;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;

class SubjectController extends ActiveController
{
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::className(),
                'except' => ['all'],
                'only' => ['create', 'index', 'delete', 'list', 'all', 'add', 'remove'],
                'rules' => [
                    [
                        'actions' => ['create', 'index', 'delete', 'list', 'all', 'add', 'remove'],
                        'allow' => true,
                        'roles' => ['teacher', 'admin', 'student', 'superadmin'],
                    ],
                ],
            ],
        ]);
    }

    private $user;
    public $modelClass = 'frontend\modules\v1\models\Subject';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'list' => ['GET'],
            'all' => ['GET'],
            'add' => ['POST'],
            'remove' => ['POST'],
            'get-subjects-list' => ['GET'],
            'get-tutors-subjects' => ['GET'],
            'get-tutor-subject-list' => ['GET'],
            'get-free-videos-subjects' => ['GET'],
            'get-videos-subjects' => ['GET'],
            'save-order' => ['POST']
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

    public function actionGetTutorsSubjects()
    {
        $result = ArrayHelper::getColumn(TutorSubject::find()->select('subject_id')->distinct()->asArray()->all(), 'subject_id');
        return SubjectOrigin::find()->where(['id' => $result])->all();
    }

    public function prepareDataProvider()
    {
        $model = new Subject();
        $provider = new ActiveDataProvider([
            'query' => $model->find()->where(['user_id' => $this->user->id])
        ]);
        return $provider;

    }

    public function actionGetSubjectsList()
    {
        return SubjectOrigin::find()->all();
    }

    public function actionAll($exam_id)
    {
        $subjects = Subject::find()->where(['examtype_id' => $exam_id])->orderBy('sort')->all();
        return $subjects;
    }

    public function actionList($exam_id)
    {
        $subjectsIds = ArrayHelper::getColumn(Subject::find()->where(['examtype_id' => $exam_id])->orderBy('sort')->all(), 'subject_origin_id');
        $list = SubjectOrigin::find()->where(['not in', 'id', $subjectsIds])->all();
        return $list;
    }

    public function actionGetTutorSubjectList($id)
    {
        $subjects = [];
        $subjectsIds = ArrayHelper::getColumn(Subject::find()->where(['examtype_id' => $id])->orderBy('sort')->all(), 'subject_origin_id');
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        foreach ($tutor->tutorSubjects as $subject) {
            if (!in_array($subject->id, $subjectsIds)) {
                $subjects[] = $subject;
            }
        }

        $list = SubjectOrigin::find()->where(['not in', 'id', $subjectsIds])->all();
        return $subjects;
    }

    public function actionCreate()
    {
        $model = new SubjectOrigin();
        $request = Yii::$app->getRequest()->getBodyParams();
        $model->load($request, '');

        if ($model->save()) {
            return $model;
        } else {
            throw new \yii\web\HttpException(500, 'Internal server error');
        }
    }

    public function actionSaveOrder()
    {
        $request = Yii::$app->request->getBodyParams();
        foreach ($request as $id => $subject) {
            $item = Subject::findOne($subject['id']);
            $item->sort = $subject['order'];
            $item->save();
        }

        return true;
    }

    public function actionAdd()
    {
        $model = new Subject();
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        $checkModel = Subject::findOne(['subject_origin_id' => $model->subject_origin_id, 'examtype_id' => $model->examtype_id]);
        if (!$checkModel && $model->save()) {
            return $model;
        } else {
            throw new \yii\web\HttpException(500, 'Internal server error');
        }
    }

    public function actionDelete($id)
    {
        $model = SubjectOrigin::findOne(['id' => $id]);
        if (!$model) {
            throw new NotFoundHttpException;
        } elseif ($model->delete() === false) {
            throw new HttpException(500, 'Internal Server Error');
        }
    }

    public function actionGetFreeVideosSubjects()
    {
        $subjects = AdminVideo::getFreeVideosSubjects();
        return $subjects;
    }

    public function actionGetVideosSubjects()
    {
        $subjects = AdminVideo::getVideosSubjects();
        return $subjects;
    }

    public function actionRemove($id)
    {
        $model = Subject::findOne(['id' => $id]);
        if (!$model) {
            throw new NotFoundHttpException;
        } elseif ($model->delete() === false) {
            throw new HttpException(500, 'Internal Server Error');
        }
    }

}