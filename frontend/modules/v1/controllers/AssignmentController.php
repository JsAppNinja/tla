<?php
namespace frontend\modules\v1\controllers;

use common\models\Assignment;
use common\models\AssignmentFile;
use common\models\AssignmentMsg;
use common\models\AssignmentStudent;
use common\models\Student;
use common\models\Subject;
use frontend\modules\v1\models\User;
use Yii;
use yii\rest\ActiveController;
use yii\web\UploadedFile;

class AssignmentController extends ActiveController
{
    private $user;
    public $modelClass = 'frontend\modules\v1\models\Assignment';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'add-file' => ['POST'],
            'get-assignments' => ['GET'],
            'delete-file' => ['DELETE'],
            'get-assignment-data' => ['GET'],
            'get-comment' => ['GET'],
            'add-student-assignment' => ['POST'],
            'add-comment' => ['POST']
        ];

        return array_merge(parent::verbs(), $verbs);
    }

    public function actionCreate()
    {
        $request = Yii::$app->request->getBodyParams();

        $model = new Assignment();

        $model->load($request, '');

        $model->save();
        return $model;
    }

    public function actionGetAssignments()
    {
        $lesson_id = Yii::$app->request->getQueryParam('lesson_id');

        return Assignment::find()->where(['lesson_id' => $lesson_id])->all();
    }

    public function actionAddFile()
    {
        $request = Yii::$app->request->getBodyParams();

        $model = new AssignmentFile();

        $model->file = UploadedFile::getInstanceByName('File');
        $model->assignment_id = $request['id'];

        return $model->upload();
    }

    public function actionDeleteFile()
    {
        $file_id = Yii::$app->request->getQueryParam('file');

        return AssignmentFile::deleteAll(['id' => $file_id]);
    }

    public function actionGetAssignmentData($id)
    {
        $subject_id = Yii::$app->request->getQueryParam('subject_id');

        $subject = Subject::findOne($subject_id);

        $assignment = Assignment::findOne($id);

        $response = [];

        $response['assignment'] = $assignment;
        $response['students'] = $subject->students;

        return $response;
    }

    public function actionGetComment($id)
    {
        $student_id = Yii::$app->request->getQueryParam('student_id');
        $student = Student::findOne($student_id);
        $tutor = $this->user->getUserTypeInstance();
        $messages = [];

        $assignment = AssignmentStudent::find()->where(['student_id' => $student_id, 'assignment_id' => $id])->one();
        if($assignment) {
            $messages = AssignmentMsg::find()->where(['assignment_student_id' => $assignment->id])->all();
        }

        $response = [];
        $response['student_avatar'] = $student->getAvatarPath().$student->avatar;
        $response['tutor_avatar'] = $tutor->getAvatar();
        $response['data'] = $messages;
        $response['files'] = AssignmentFile::find()->where(['student_id' => $student_id, 'assignment_id' => $id])->all();

        return $response;

    }

    public function actionAddStudentAssignment()
    {
        $request = Yii::$app->request->getBodyParams();
        $student = $this->user->getUserTypeInstance();
        $assignment = AssignmentStudent::find()->where(['student_id' => $student->id, 'assignment_id' => $request['assignment_id']])->one();
        if(!$assignment) {
            $assignment = new AssignmentStudent();
            $assignment->assignment_id = $request['assignment_id'];
            $assignment->student_id = $student->id;
            $assignment->save();
        }

        $message = new AssignmentMsg();
        $message->assignment_student_id = $assignment->id;
        $message->owner_type = AssignmentMsg::OWNER_STUDENT;
        $message->owner_id = $student->id;
        $message->body = $request['comment'];
        $message->save();

        return $message;
    }

    public function actionAddComment() {
        $student_id = Yii::$app->request->getBodyParam('student_id');
        $assignment_id = Yii::$app->request->getBodyParam('assignment_id');
        $body = Yii::$app->request->getBodyParam('body');

        $tutor = $this->user->getUserTypeInstance();

        $assignment = AssignmentStudent::find()->where(['student_id' => $student_id, 'assignment_id' => $assignment_id])->one();

        $message = new AssignmentMsg();

        $message->assignment_student_id = $assignment->id;
        $message->owner_type = AssignmentMsg::OWNER_TUTOR;
        $message->owner_id = $tutor->id;
        $message->body = $body;
        $message->save();

        return $message;
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['create']);
        return $actions;
    }
}