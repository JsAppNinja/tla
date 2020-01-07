<?php
namespace frontend\modules\v1\controllers;

use common\models\Examtype;
use common\models\GradeStudent;
use common\models\Quize;
use common\models\Student;
use common\models\Subject;
use common\models\SubjectOrigin;
use common\models\SubjectStudent;
use common\models\TutorAnnounce;
use common\models\TutorSubject;
use common\models\TutorVideo;
use Exception;
use frontend\components\Helpers\MixPanelHelper;
use frontend\modules\v1\models\Chat;
use frontend\modules\v1\models\Quizpractice;
use frontend\modules\v1\models\QuizpracticeList;
use frontend\modules\v1\models\Tutor;
use linslin\yii2\curl\Curl;
use Vimeo\Vimeo;
use Yii;
use yii\helpers\ArrayHelper;
use yii\helpers\FileHelper;
use yii\helpers\Url;
use yii\imagine\Image;
use yii\rest\ActiveController;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\web\UnauthorizedHttpException;

class TutorController extends ActiveController
{
    private $user;
    public $modelClass = 'frontend\modules\v1\models\Tutor';

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
            'get-profile-info' => ['GET'],
            'get-subjects' => ['GET'],
            'save-subjects' => ['PUT'],
            'get-students-requests' => ['GET'],
            'accept-student' => ['POST'],
            'reject-student' => ['POST'],
            'dismiss-student' => ['POST'],
            'update-avatar' => ['POST'],
            'load-video' => ['GET'],
            'get-videos' => ['GET'],
            'test-video' => ['POST'],
            'get-students' => ['GET'],
            'delete-video' => ['DELETE'],
            'update-video' => ['PUT'],
            'add-sample-video' => ['POST'],
            'get-sample-video' => ['GET'],
            'remove-sample-video' => ['DELETE'],
            'get-subject-students' => ['GET'],
            'get-grade-levels' => ['GET'],
            'save-schedule' => ['POST'],
            'get-schedule' => ['GET'],
            'get-announce' => ['GET'],
            'set-announce' => ['POST'],
            'get-subjects-price' => ['GET'],
            'get-min-max-subject-price' => ['GET'],
            'save-subjects-prices' => ['POST'],
            'set-subject-access' => ['PUT'],
            'get-students-results' => ['GET'],
            'view-student-result' => ['GET'],
            'add-result-comment' => ['POST']
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['index']);
        return $actions;
    }

    public function actionUpdateAvatar()
    {
        $request = Yii::$app->request->getBodyParams();
        $cropped = $request['cropped'];
        $cropped = str_replace('data:image/png;base64,', '', $cropped);
        $cropped_data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $cropped));
        $cropped_file_name = uniqid();

        $original = $request['original'];
        $original = str_replace('data:image/png;base64,', '', $original);
        $original_data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $original));
        $original_file_name = uniqid();

        $tutor = Tutor::findOne(['user_id' => $this->user->id]);

        $avatar_dir = Yii::$app->basePath .
            DIRECTORY_SEPARATOR .
            'web' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'avatars' . DIRECTORY_SEPARATOR . 'tutors' . DIRECTORY_SEPARATOR . $tutor->id;
        if (FileHelper::createDirectory($avatar_dir)) {
            $cropped_file = $avatar_dir . DIRECTORY_SEPARATOR . $cropped_file_name . '.png';
            $original_file = $avatar_dir . DIRECTORY_SEPARATOR . $original_file_name . '.png';
            if (file_put_contents($cropped_file, $cropped_data) && file_put_contents($original_file, $original_data)) {
                if ($tutor->avatar) {
                    unlink($avatar_dir . DIRECTORY_SEPARATOR . $tutor->avatar);
                    unlink($avatar_dir . DIRECTORY_SEPARATOR . $tutor->avatar_original);
                }
                $tutor->avatar = $cropped_file_name . '.png';
                $tutor->avatar_original = $original_file_name . '.png';
                if ($tutor->save()) {
                    return true;
                }
            }
        }
        throw new HttpException('Error');
    }

    public function actionIndex()
    {
        return Tutor::find()->all();
    }

    public function actionGetMinMaxSubjectPrice($id)
    {
        $response = [];

        if ($id == 0) {
            $response['min'] = Tutor::find()->select('price_per_subject')->min('price_per_subject');
            $response['max'] = Tutor::find()->select('price_per_subject')->max('price_per_subject');

        }
        if ($id == 1) {
            $response['min'] = Tutor::find()->select('price_for_all_subjects')->min('price_for_all_subjects');
            $response['max'] = Tutor::find()->select('price_for_all_subjects')->max('price_for_all_subjects');
        }

        return $response;
    }


    public function actionUpdate()
    {
        $request = Yii::$app->request->getBodyParams();
        $tutor = Tutor::findOne($request['id']);
        $tutor->load($request, '');

        $mp = new MixPanelHelper(Yii::$app->user->identity);
        $mp->track('Update profile info');

        $tutor->save();
        return $tutor;
    }

    public function actionGetSubjects()
    {
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        return $tutor->tutorSubjects;
    }

    public function actionSaveSubjects()
    {
        $request = Yii::$app->request->getBodyParams();
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        try {
            TutorSubject::deleteAll(['tutor_id' => $tutor->id]);
            foreach ($request as $item) {
                $subject = SubjectOrigin::findOne(['id' => $item['id']]);
                $tutor->link('tutorSubjects', $subject);
            }
        } catch (Exception $e) {
            $a = $e->getMessage();
            throw new HttpException($a);
        }
        return true;
    }

    public function actionGetStudentsRequests()
    {
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        return $tutor->studentRequests;
    }

    public function actionGetStudents()
    {
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        return $tutor->tutorStudents;
    }

    public function actionGetSubjectStudents($id)
    {
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        $students = [];
        foreach ($tutor->tutorStudents as $student) {
            $studentData = [];
            $studentData['id'] = $student->id;
            $studentData['first_name'] = $student->first_name;
            $studentData['last_name'] = $student->last_name;
            if (SubjectStudent::findOne(['subject_id' => $id, 'student_id' => $student->id])) {
                $studentData['active'] = 1;
            } else {
                $studentData['active'] = 0;
            }
            $students[] = $studentData;
        }

        return $students;
    }

    public function actionAcceptStudent()
    {
        $request = Yii::$app->request->getBodyParams();
        try {
            $tutor = Tutor::findOne(['user_id' => $this->user->id]);
            $student = Student::findOne($request['id']);


            $tutor->link('tutorStudents', $student);
            $tutor->unlink('studentRequests', $student, true);
            $tutor->sendAcceptToSudent($student);

            $chat = new Chat();
            $chat->createdBy_id = $tutor->user_id;
            $chat->type = Chat::PERMANENT;
            $chat->status = Chat::STATUS_ACTIVE;
            $chat->save();

            $chat->link('users', $student->user);
            $chat->link('users', $tutor->user);

        } catch (Exception $e) {
            $a = $e->getMessage();
            throw new HttpException($a);
        }

        return true;
    }

    public function actionRejectStudent()
    {
        $request = Yii::$app->request->getBodyParams();

        try {
            $student = Student::findOne($request['id']);
            $tutor = Tutor::findOne(['user_id' => $this->user->id]);

            $tutor->unlink('studentRequests', $student, true);
            $tutor->sendRejectToSudent($student);

        } catch (Exception $e) {
            $a = $e->getMessage();
            throw new HttpException($a);
        }

        return true;
    }

    public function actionDismissStudent()
    {
        $request = Yii::$app->request->getBodyParams();
        try {
            $student = Student::findOne($request['id']);
            $tutor = Tutor::findOne(['user_id' => $this->user->id]);

            $tutor->unlink('tutorStudents', $student, true);

            foreach ($tutor->acceptedStudentsChats as $item) {
                foreach ($item->users as $user) {
                    if ($user->id == $student->user->id) {
                        $item->status = Chat::STATUS_DELETED;
                        $item->save();
                    }
                }
            }

            $tutor->sendDissmissToSudent($student);
        } catch (Exception $e) {
            $a = $e->getMessage();
            throw new HttpException($a);
        }

        return true;
    }

    public function actionGetProfileInfo()
    {
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        return $tutor;
    }

    public function actionLoadVideo()
    {
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $response = $lib->request('/me/videos', ['type' => 'streaming'], 'POST');
        return $response;
    }

    public function actionTestVideo()
    {
        $request = Yii::$app->request->getBodyParams();
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $response = $lib->request($request['complete_uri'], [], 'DELETE');

        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        $video = new TutorVideo();

        $video->tutor_id = $tutor->id;
        $video->video_url = $response['headers']['Location'];
        $video->lesson_id = $request['lesson_id'];
        $video->title = $request['title'];
        $video->description = $request['description'];


        $mp = new MixPanelHelper(Yii::$app->user->identity);
        $mp->track('Upload video');
        $video->save();
        return $video->errors;
    }

    public function actionUpdateVideo()
    {
        $request = Yii::$app->request->getBodyParams();

        $tutor_video = TutorVideo::findOne($request['id']);

        $tutor_video->load($request, '');
        return $tutor_video->save();
    }

    public function actionDeleteVideo($id)
    {
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');

        $tutor_video = TutorVideo::findOne($id);
        $response = $lib->request($tutor_video->video_url, [], 'DELETE');
        if ($response['body'] == null) {
            return $tutor_video->delete();
        }
        return $response;
    }

    public function actionGetVideos()
    {
        $request = Yii::$app->request->getQueryParams();
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        $videos = [];
        foreach ($tutor->videos as $video) {
            if ($video->lesson_id == $request['lesson_id']) {
                if ($video->status != TutorVideo::VIDEO_AVAILABLE) {
                    $response = $lib->request($video->video_url, array(), 'GET');
                    $video->iframe = $response['body']['embed']['html'];
                    switch ($response['body']['status']) {
                        case 'available': {
                            $video->status = TutorVideo::VIDEO_AVAILABLE;
                            $video->preview_img = $response['body']['pictures']['sizes'][1]['link'];
                            break;
                        }
                        case 'transcoding': {
                            $video->status = TutorVideo::VIDEO_TRANSCODING;
                            break;
                        }
                        default: {
                            $video->status = TutorVideo::VIDEO_ERROR;
                            break;
                        }
                    }
                    $video->save();
                }
                $videos[] = $video;
            }
        }
        return $videos;
    }

    public function actionAddSampleVideo()
    {
        $request = Yii::$app->request->getBodyParams();
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $response = $lib->request($request['complete_uri'], [], 'DELETE');

        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        $tutor->sample_video_link = $response['headers']['Location'];
        return $tutor->save();
    }

    public function actionGetSampleVideo()
    {
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);
        if ($tutor->sample_video_link) {
            $response = $lib->request($tutor->sample_video_link, array(), 'GET');
            $tutor->iframe = $response['body']['embed']['html'];
            if ($response['body']['status'] == 'available') {
                $tutor->preview_video_img = $response['body']['pictures']['sizes'][1]['link'];
            }
            $tutor->save();
            return $tutor->iframe;
        }
        return '';
    }

    public function actionRemoveSampleVideo()
    {
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');

        $tutor = Tutor::findOne(['user_id' => $this->user->id]);

        $response = $lib->request($tutor->sample_video_link, [], 'DELETE');
        if ($response['body'] == null) {
            $tutor->sample_video_link = null;
            $tutor->iframe = null;
            $tutor->preview_video_img = null;
            $tutor->save();
        }
        return $response;
    }

    public function actionSetSubjectAccess($id)
    {
        $request = Yii::$app->request->getBodyParams();
        $grade = Examtype::findOne($request['grade_id']);
        if ($grade->checkOwner()) {
            $subject = Subject::findOne($request['subject_id']);
            $student = Student::findOne($id);
            if ($request['active']) {
                $subject->link('students', $student);
            } else {
                $subject->unlink('students', $student, true);
            }
        }
        return $id;
    }

    public function actionGetGradeLevels()
    {
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);

        return $tutor->gradeLevels;
    }

    public function actionSaveSchedule()
    {
        $request = Yii::$app->request->getBodyParams();
        $grade_level = Examtype::findOne($request['grade_id']);

        if ($grade_level->checkOwner()) {
            $grade_level->schedule = $request['schedule'];
            return $grade_level->save();
        }

        throw new NotFoundHttpException('Not found');

    }

    public function actionGetSchedule($id)
    {
        $grade_level = Examtype::find()->where(['id' => $id])->one();
        if ($grade_level->checkOwner()) {
            $response['schedule'] = $grade_level->schedule;
            return $response;
        }
    }

    public function actionGetAnnounce()
    {
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);

        if ($tutor->announce->status == 1) {
            $currentDate = new \DateTime();
            $announceDate = new \DateTime();
            $announceDate = $announceDate->createFromFormat('Y-m-d H:i:s', $tutor->announce->date);

            if ($currentDate >= $announceDate) {
                $tutor->announce->date = null;
                $tutor->announce->status = 0;
                $tutor->announce->save();
            }
        }


        return $tutor->announce;
//        return $currentDate > $announceDate;
    }

    public function actionSetAnnounce()
    {
        $request = Yii::$app->request->getBodyParams();
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);

        if ($tutor->announce) {
            $announce = $tutor->announce;
        } else {
            $announce = new TutorAnnounce();
            $announce->tutor_id = $tutor->id;
        }
        if ($request['status'] == 1) {
            foreach ($tutor->tutorStudents as $student) {
                $tutor->sendAnnounceToStudents($student);
            }
        }
        $announce->load($request, '');
        $announce->save();

        return $announce->date;

    }

    public function actionGetSubjectsPrice()
    {
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);

        $response['price_per_subject'] = $tutor->price_per_subject;
        $response['price_for_all_subjects'] = $tutor->price_for_all_subjects;

        return $response;
    }

    public function actionSaveSubjectsPrices()
    {
        $request = Yii::$app->request->getBodyParams();
        $tutor = Tutor::findOne(['user_id' => $this->user->id]);

        $tutor->price_per_subject = $request['price_per_subject'];
        $tutor->price_for_all_subjects = $request['price_for_all_subjects'];

        return $tutor->save();
    }

    public function actionGetStudentsResults()
    {
        $id = Yii::$app->request->getQueryParam('id');

        $tutor = Tutor::findOne(['user_id' => $this->user->id]);

        $gradeIds = ArrayHelper::getColumn($tutor->gradeLevels, 'id');

        $subjects = Subject::find()->where(['examtype_id' => $gradeIds])->select('id')->all();
        $subjectsIds = ArrayHelper::getColumn($subjects, 'id');
        $quizzes = Quize::find()->where(['subject_id' => $subjectsIds])->select('id')->all();
        $quizzesIds = ArrayHelper::getColumn($quizzes, 'id');

        $quizPracticeQuery = QuizpracticeList::find()->where(['quiz_id' => $quizzesIds, 'status' => Quizpractice::FINISHED]);
        if ($id) {
            $student = Student::findOne($id);
            $quizPracticeQuery->andWhere(['student_id' => $student->user->id]);
        }

        return $quizPracticeQuery->all();
    }

    public function actionViewStudentResult($id)
    {
        $quizpractice = Quizpractice::findOne(['id' => $id]);
        $quizpractice->answers = json_decode($quizpractice->answers, true);
        $result = Quizpractice::checkAnswers($quizpractice->answers, $quizpractice->quiz->questions);

        $response['html'] = $this->renderPartial('/student/practiceExam/result', compact('result', 'quizpractice', 'backUrl'));
        $response['comment'] = $quizpractice->comment;
        return $response;

    }

    public function actionAddResultComment($id)
    {
        $request = Yii::$app->request->getBodyParams();
        $quizpractice = Quizpractice::findOne($id);
        $quizpractice->comment = $request['comment'];
        $quizpractice->save();
        return $quizpractice;
    }
}