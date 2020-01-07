<?php

namespace common\models;

use frontend\modules\v1\models\Tutor;
use Yii;

/**
 * This is the model class for table "student".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $first_name
 * @property string $last_name
 *
 * @property User $user
 * @property StudentRequest[] $studentRequests
 * @property TutorStudent[] $tutorStudents
 */
class Student extends \yii\db\ActiveRecord
{
    const MONTHLY_PAYMENT = 10;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'student';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id'], 'required'],
            [['user_id'], 'integer'],
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
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::className(), ['id' => 'user_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getStudentRequests()
    {
        return $this->hasMany(Tutor::className(), ['id' => 'tutor_id'])
            ->viaTable('student_request', ['student_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutorStudents()
    {
        return $this->hasMany(Tutor::className(), ['id' => 'tutor_id'])
            ->viaTable('tutor_student', ['student_id' => 'id']);
    }

    public function getStudentSubjects()
    {
        return $this->hasMany(Subject::className(), ['id' => 'subject_id'])
            ->viaTable('subject_student', ['student_id' => 'id']);
    }

    public function getFullName()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getAcceptedTutorsChats()
    {
        return $this->hasMany(Chat::className(), ['id' => 'chat_id'])->where(['type' => Chat::PERMANENT])
            ->viaTable('chat_user', ['user_id' => 'user_id']);
    }

    public function chatWithTutor($id)
    {
        foreach ($this->user->chats as $item) {
            foreach ($item->users as $user) {
                if ($user->id == $id) {
                    return $item;
                }
            }
        };
        return null;
    }

    public function getAvatarServerPath()
    {
        return $avatar_dir = Yii::$app->basePath .
            DIRECTORY_SEPARATOR .
            'web' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'avatars' . DIRECTORY_SEPARATOR . 'students' . DIRECTORY_SEPARATOR . $this->id;
    }

    public function getAvatarPath() {
        return '/uploads/avatars/students/'.$this->id.DIRECTORY_SEPARATOR;
    }

}
