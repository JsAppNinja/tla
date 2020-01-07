<?php

namespace common\models;

use common\models\TutorAnnounce;
use Yii;

/**
 * This is the model class for table "tutor".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $profile_description
 * @property string $payment_description
 * @property string $sample_video_link
 * @property string $first_name
 * @property string $last_name
 *
 * @property StudentRequest[] $studentRequests
 * @property User $user
 * @property TutorStudent[] $tutorStudents
 * @property TutorSubject[] $tutorSubjects
 */
class Tutor extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'tutor';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id'], 'required'],
            [['user_id'], 'integer'],
            [['profile_description', 'payment_description', 'sample_video_link', 'skype', 'phone'], 'string'],
            [['first_name', 'last_name'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'profile_description' => 'Profile Description',
            'payment_description' => 'Payment Description',
            'sample_video_link' => 'Sample Video Link',
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
        ];
    }

    public function getTutorNotesPath()
    {
        return DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'notes' . DIRECTORY_SEPARATOR . 'tutors' . DIRECTORY_SEPARATOR . $this->id;
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getStudentRequests()
    {
        return $this->hasMany(Student::className(), ['id' => 'student_id'])
            ->viaTable('student_request', ['tutor_id' => 'id']);
    }

    public function getAvatar()
    {
        return '/uploads/avatars/tutors/' . $this->id . '/' . $this->avatar;
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::className(), ['id' => 'user_id']);
    }

    public function getFullName()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutorStudents()
    {
        return $this->hasMany(Student::className(), ['id' => 'student_id'])
            ->viaTable('tutor_student', ['tutor_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutorStudentsExcept()
    {
        $student = Yii::$app->user->identity->getUserTypeInstance();
        return $this->hasMany(Student::className(), ['id' => 'student_id'])->andWhere(['!=','id', $student->id])
            ->viaTable('tutor_student', ['tutor_id' => 'id']);
    }



    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutorSubjects()
    {
        return $this->hasMany(SubjectOrigin::className(), ['id' => 'subject_id'])
            ->viaTable('tutor_subject', ['tutor_id' => 'id']);
    }

    public function sendDissmissToSudent($student)
    {
        return Yii::$app->mailer->compose(['html' => 'studentDismissFromTutor'], ['student' => $student, 'tutor' => $this])
            ->setFrom([Yii::$app->components['mailer']['transport']['username'] => 'PassGeek.com'])
            ->setTo($student->user->email)
            ->setSubject('PassGeek.com')
            ->send();
    }

    public function sendRejectToSudent($student)
    {
        return Yii::$app->mailer->compose(['html' => 'studentRejectFromTutor'], ['student' => $student, 'tutor' => $this])
            ->setFrom([Yii::$app->components['mailer']['transport']['username'] => 'PassGeek.com'])
            ->setTo($student->user->email)
            ->setSubject('PassGeek.com')
            ->send();
    }

    public function sendAcceptToSudent($student)
    {
        return Yii::$app->mailer->compose(['html' => 'studentAcceptFromTutor'], ['student' => $student, 'tutor' => $this])
            ->setFrom([Yii::$app->components['mailer']['transport']['username'] => 'PassGeek.com'])
            ->setTo($student->user->email)
            ->setSubject('PassGeek.com')
            ->send();
    }

    public function getVideos()
    {
        return $this->hasMany(TutorVideo::className(), ['tutor_id' => 'id']);
    }

    public function getGradeLevels()
    {
        return $this->hasMany(Examtype::className(), ['user_id' => 'user_id']);
    }

    public function getAnnounce()
    {
        return $this->hasOne(TutorAnnounce::className(), ['tutor_id' => 'id']);
    }

    public function sendAnnounceToStudents($student)
    {
        return Yii::$app->mailer->compose(['html' => 'studentTutorAnnounce'], ['student' => $student, 'tutor' => $this])
            ->setFrom([Yii::$app->components['mailer']['transport']['username'] => 'PassGeek.com'])
            ->setTo($student->user->email)
            ->setSubject('PassGeek.com - Tutor announcement')
            ->send();
    }

    public function getAcceptedStudentsChats() {
        return $this->hasMany(Chat::className(), ['createdBy_id' => 'user_id'])->where(['type' => Chat::PERMANENT]);
    }

    public function getStudentsChats()
    {
        return $this->hasMany(Chat::className(), ['id' => 'chat_id'])->where(['type' => Chat::PERMANENT])
            ->viaTable('chat_user', ['user_id' => 'user_id']);
    }

    public function getAcceptedStudentChat() {
        $student_id = Yii::$app->user->identity->id;
        $chats = $this->hasMany(Chat::className(), ['id' => 'chat_id'])->andWhere(['type' => Chat::PERMANENT])
            ->viaTable('chat_user', ['user_id' => 'user_id'])->all();

        foreach ($chats as $chat) {
            foreach ($chat->users as $user) {
                if($user->id == $student_id) {
                    return $chat->id;
                }
            }
        }

        return null;
    }
}
