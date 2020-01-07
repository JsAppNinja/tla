<?php
namespace frontend\modules\v1\controllers;

use common\models\AssignmentFile;
use common\models\AssignmentMsg;
use common\models\AssignmentStudent;
use common\models\Chat;
use common\models\Lesson;
use common\models\TutorVideo;
use common\models\User;
use frontend\components\Helpers\MixPanelHelper;
use frontend\modules\v1\models\Student;
use frontend\modules\v1\models\Tutor;
use Yii;
use yii\rest\ActiveController;
use yii\web\NotFoundHttpException;
use yii\web\UnauthorizedHttpException;
use yii\web\UploadedFile;

class StudentController extends ActiveController
{
    private $user;
    private $current_tutor;

    public $modelClass = 'frontend\modules\v1\models\Student';

    public function init()
    {
        parent::init();
        if (!$this->user = Yii::$app->user->identity) {
            throw new UnauthorizedHttpException('You are not authorized');
        }
    }

    public function verbs()
    {
        $verbs = [
            'send-request' => ['POST'],
            'get-subjects' => ['GET'],
            'get-lessons' => ['GET'],
            'get-lesson' => ['GET'],
            'get-grade-levels' => ['GET'],
            'get-profile-data' => ['GET'],
            'update-avatar' => ['POST'],
            'change-password' => ['POST'],
            'save-profile' => ['POST'],
            'upload-assignment' => ['POST']
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['index']);
        return $actions;
    }

    public function actionSendRequest()
    {
        $request = Yii::$app->request->getBodyParams();
        $student = Student::findOne(['user_id' => $this->user->id]);
        $tutor = Tutor::findOne($request['id']);

        $mp = new MixPanelHelper(Yii::$app->user->identity);
        $mp->track('Send request for tutor');

        return $student->link('studentRequests', $tutor);
    }

    public function actionGetProfileInfo()
    {
        $student = Student::findOne(['user_id' => $this->user->id]);
        return $student;
    }

    public function actionGetGradeLevels($id)
    {
        $student = Student::findOne(['user_id' => $this->user->id]);
        foreach ($student->tutorStudents as $tutor) {
            if ($tutor->id == $id) {
                $grade_levels = [];
                foreach ($student->studentSubjects as $subject) {
                    if ($subject->examtype->active && $subject->examtype->user_id == $tutor->user_id) {
                        $grade_level['id'] = $subject->examtype->id;
                        $grade_level['name'] = $subject->examtype->name;
                        $grade_level['schedule'] = $subject->examtype->schedule;

                        if (!in_array($grade_level, $grade_levels)) {
                            $grade_levels[] = $grade_level;
                        }
                    }
                }
                $response['grade_levels'] = $grade_levels;
                foreach ($tutor->tutorStudentsExcept as $item) {
                    $std = [];
                    $std['data'] = $item;
                    $std['hasChat'] = false;
                    foreach (Yii::$app->user->identity->chats as $chat) {
                        if (($chat->type == Chat::CUSTOM) &&
                            ($chat->status == Chat::STATUS_ACTIVE) &&
                            ($chat->opponent->id == $item->user_id)
                        ) {
                            $std['hasChat'] = true;
                        }
                    }
                    $response['students'][] = $std;
                }


                return $response;
            }
        }
        throw new NotFoundHttpException('Not found');
    }

    public function actionGetSubjects()
    {
        $request = Yii::$app->request->getQueryParams();
        $student = Student::findOne(['user_id' => $this->user->id]);
        foreach ($student->tutorStudents as $tutor) {
            if ($tutor->id == $request['tutor_id']) {
                $subjects = [];
                foreach ($student->studentSubjects as $item) {
                    if ($item->examtype->active && ($item->examtype->id == $request['level_id'])) {
                        $subject['id'] = $item->id;
                        $subject['name'] = $item->subjectOrigin->name;
                        $subjects[] = $subject;
                    }
                }
                return $subjects;
            }
        }
        throw new NotFoundHttpException('Not found');
    }

    public function actionGetLessons()
    {
        $request = Yii::$app->request->getQueryParams();
        $student = Student::findOne(['user_id' => $this->user->id]);
        foreach ($student->tutorStudents as $tutor) {
            if ($tutor->id == $request['tutor_id']) {
                foreach ($student->studentSubjects as $item) {
                    if ($item->examtype->active && ($item->id == $request['subject_id'])) {
                        $lessons = [];
                        foreach ($item->lessons as $lesson_item) {
                            $lesson['id'] = $lesson_item->id;
                            $lesson['name'] = $lesson_item->title;
                            $lessons[] = $lesson;
                        }
                    }
                }
                return $lessons;
            }
        }
        throw new NotFoundHttpException('Not found');
    }

    public function actionGetLesson($id)
    {
        $request = Yii::$app->request->getQueryParams();

        $student = Student::findOne(['user_id' => $this->user->id]);
        $this->current_tutor = Tutor::findOne($request['tutor_id']);

        foreach ($student->tutorStudents as $tutor) {
            if ($tutor->id == $request['tutor_id']) {
                foreach ($student->studentSubjects as $item) {
                    if ($item->examtype->active && ($item->id == $request['subject_id'])) {
                        foreach ($item->lessons as $lesson_item) {
                            if ($lesson_item->id == $id) {
                                $lesson = [];
                                $lesson['title'] = $lesson_item->title;
                                $lesson['description'] = $lesson_item->description;
                                $lesson['videos'] = $this->getLessonVideos($lesson_item->id);
                                $lesson['quizzes'] = $lesson_item->activeQuizzes;
                                $lesson['notes'] = $lesson_item->notes;
                                foreach ($lesson_item->assignments as $assignment_item) {
                                    $assignment['id'] = $assignment_item->id;
                                    $assignment['name'] = $assignment_item->name;
                                    $assignment['description'] = $assignment_item->description;
                                    $assignment['files'] = $assignment_item->assignmentFiles;
                                    $assignment['student_files'] = $assignment_item->assignmentStudentFiles;
                                    $student_assignment = AssignmentStudent::find()->where(['student_id' => $student->id, 'assignment_id' => $assignment_item->id])->one();
                                    $comments = [];
                                    $comment_item = [];
                                    if ($student_assignment) {
                                        $comments = AssignmentMsg::find()->where(['assignment_student_id' => $student_assignment->id])->all();
                                        $comment_item['student_avatar'] = $student->getAvatarPath() . $student->avatar;
                                        $comment_item['tutor_avatar'] = $tutor->getAvatar();
                                    }
                                    $assignment['comments'] = $comment_item;
                                    $assignment['comments']['data'] = $comments;
                                    $lesson['assignments'][] = $assignment;
                                }
                                return $lesson;
                            }
                        }
                    }
                }
            }
        }
    }

    private function getLessonVideos($lesson_id)
    {
        $videos = [];
        foreach ($this->current_tutor->videos as $video) {
            if ($video->lesson_id == $lesson_id) {
                if ($video->status == TutorVideo::VIDEO_AVAILABLE) {
                    $videos[] = $video;
                }
            }
        }
        return $videos;
    }

    public function actionGetProfileData()
    {
        $student = Student::findOne(['user_id' => $this->user->id]);
        return $student;
    }

    public function actionUpdateAvatar()
    {
        $request = Yii::$app->request->getBodyParams();

        return $this->user->updateAvatar($request);

    }

    public function actionSaveProfile()
    {
        $request = Yii::$app->request->getBodyParams();

        $student = $this->user->getUserTypeInstance();

        $student->load($request, '');

        return $student->save();
    }

    public function actionChangePassword()
    {
        $request = Yii::$app->request->getBodyParams();

        return $this->user->changePassword($request);
    }

    public function actionUploadAssignment()
    {
        $request = Yii::$app->request->getBodyParams();
        $student = $this->user->getUserTypeInstance();
        $model = new AssignmentFile();
//
        $model->file = UploadedFile::getInstanceByName('File');
        $model->assignment_id = $request['id'];
        $model->student_id = $student->id;
        return $model->upload();
//        return $_FILES;
    }

}