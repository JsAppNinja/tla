<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "exam".
 *
 * @property integer $id
 * @property string $name
 * @property integer $examtype_id
 * @property integer $subject_id
 * @property string $date
 * @property string $hours
 * @property integer $user_id
 *
 * @property Essay[] $essays
 * @property Examtype $examtype
 * @property Question[] $questions
 */
class Exam extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'exam';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['examtype_id', 'subject_id', 'user_id'], 'integer'],
            [['date'], 'safe'],
            [['user_id'], 'required'],
            [['name'], 'string', 'max' => 255],
            [['hours'], 'string', 'max' => 10]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'examtype_id' => 'Examtype ID',
            'subject_id' => 'Subject ID',
            'date' => 'Date',
            'hours' => 'Hours',
            'user_id' => 'User ID',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getEssays()
    {
        return $this->hasMany(Essay::className(), ['exam_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getExamtype()
    {
        return $this->hasOne(Examtype::className(), ['id' => 'examtype_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getQuestions()
    {
        return $this->hasMany(Question::className(), ['exam_id' => 'id']);
    }
}
