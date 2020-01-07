<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "tutor_rating".
 *
 * @property integer $id
 * @property integer $tutor_id
 * @property integer $student_id
 * @property integer $type
 * @property float $rating
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property User $student
 * @property User $tutor
 */
class TutorRating extends \yii\db\ActiveRecord
{
    const TYPE_QUALITY = 0;
    const TYPE_MATERIALS = 1;
    const TYPE_COMMUNICATION = 2;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'tutor_rating';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['tutor_id', 'student_id', 'rating', 'type'], 'required'],
            [['type','tutor_id', 'student_id', 'created_at', 'updated_at'], 'integer', 'integerOnly' => false],
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
            'type' => 'Type',
            'rating' => 'Rating',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getStudent()
    {
        return $this->hasOne(User::className(), ['id' => 'student_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutor()
    {
        return $this->hasOne(User::className(), ['id' => 'tutor_id']);
    }
}
