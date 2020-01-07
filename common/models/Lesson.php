<?php

namespace common\models;

use frontend\modules\v1\models\Note;
use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "lesson".
 *
 * @property integer $id
 * @property string $title
 * @property string $description
 * @property integer $subject_id
 * @property integer $sort
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property Subject $subject
 */
class Lesson extends \yii\db\ActiveRecord
{

    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
        ];
    }

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'lesson';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['description'], 'string'],
            [['subject_id'], 'required'],
            [['subject_id', 'sort', 'created_at', 'updated_at'], 'integer'],
            [['title'], 'string', 'max' => 255]
        ];
    }


    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'title' => 'Title',
            'description' => 'Description',
            'subject_id' => 'Subject ID',
            'sort' => 'Sort',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSubject()
    {
        return $this->hasOne(Subject::className(), ['id' => 'subject_id']);
    }

    public function getQuizzes()
    {
        return $this->hasMany(Quize::className(), ['lesson_id' => 'id']);
    }

    public function getActiveQuizzes()
    {
        return $this->hasMany(Quize::className(), ['lesson_id' => 'id'])->where(['active' => 1, 'delete_time' => null]);
    }

    public function checkOwner()
    {
        return $this->subject->examtype->checkOwner();
    }

    public function getNotes()
    {
        return $this->hasMany(Note::className(), ['lesson_id' => 'id']);
    }

    public function getAssignments()
    {
        return $this->hasMany(Assignment::className(), ['lesson_id' => 'id']);
    }

}
