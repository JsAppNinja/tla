<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "tutor_subject".
 *
 * @property integer $subject_id
 * @property integer $tutor_id
 *
 * @property SubjectOrigin $subject
 * @property Tutor $tutor
 */
class TutorSubject extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'tutor_subject';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['subject_id', 'tutor_id'], 'required'],
            [['subject_id', 'tutor_id'], 'integer']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'subject_id' => 'Subject ID',
            'tutor_id' => 'Tutor ID',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSubject()
    {
        return $this->hasOne(SubjectOrigin::className(), ['id' => 'subject_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutor()
    {
        return $this->hasOne(Tutor::className(), ['id' => 'tutor_id']);
    }
}
