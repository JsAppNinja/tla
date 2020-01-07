<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "chat".
 *
 * @property integer $id
 * @property integer $tutor_id
 * @property integer $student_id
 * @property string $message
 * @property integer $readed
 * @property integer $owner
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property Student $student
 * @property Tutor $tutor
 */
class OldChat extends \yii\db\ActiveRecord
{
    const OWNER_STUDENT = 0;
    const OWNER_TUTOR = 1;
    const READED = 1;
    const UNREADED = 0;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'chat';
    }

    public function behaviors()
    {
        return [
            'class' => TimestampBehavior::className(),
        ];
    }


    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['tutor_id', 'student_id', 'readed', 'owner', 'created_at', 'updated_at'], 'integer'],
            [['message'], 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'tutor_id' => 'Tutor ID',
            'student_id' => 'Student ID',
            'message' => 'Message',
            'readed' => 'Readed',
            'owner' => 'Owner',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getStudent()
    {
        return $this->hasOne(Student::className(), ['id' => 'student_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutor()
    {
        return $this->hasOne(Tutor::className(), ['id' => 'tutor_id']);
    }
}
