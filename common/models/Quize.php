<?php

namespace common\models;

use Yii;
use yii\db\ActiveQuery;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "quize".
 *
 * @property integer $id
 * @property string $name
 * @property string $description
 * @property integer $subject_id
 * @property integer $type
 * @property date $date
 * @property hours $hours
 */
class Quize extends ActiveRecord
{

    const TYPE_MULTIPLY = 0;
    const TYPE_ESSAY = 1;

    public static function find()
    {
        return new QuizQuery(get_called_class());
    }

    public function behaviors()
    {
        return [
            'softDelete' => [
                'class' => 'common\behaviors\SoftDelete',
                // these are the default values, which you can omit
                'attribute' => 'delete_time',
                'value' => null, // this is the same format as in TimestampBehavior
                'safeMode' => true, // this processes '$model->delete()' calls as soft-deletes
            ],
        ];
    }

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'quize';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'description', 'subject_id'], 'required'],
            [['description'], 'string'],
            [['subject_id', 'lesson_id', 'type'], 'integer'],
            [['date'], 'date', 'format' => 'yyyy-d-M'],
            [['hours', 'active'], 'integer'],
            [['name'], 'string', 'max' => 250]
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
            'description' => 'Description',
            'date' => 'Date',
            'hours' => 'Hours',
            'subject_id' => 'Subject ID',
        ];
    }

    public function getSubject()
    {
        return $this->hasOne(Subject::className(), ['id' => 'subject_id']);
    }

    public function getQuestions()
    {
        return $this->hasMany(Question::className(), ['quize_id' => 'id']);
    }

    public function getSections()
    {
        return $this->hasMany(Section::className(), ['quiz_id' => 'id']);
    }

    public function checkType()
    {
        foreach ($this->questions as $question) {
            if (!$question->essay) {
                return Quize::TYPE_MULTIPLY;
            }
        }

        return Quize::TYPE_ESSAY;
    }

    public function getLesson()
    {
        return $this->hasOne(Lesson::className(), ['id' => 'lesson_id']);
    }
}

class QuizQuery extends ActiveQuery
{
    public function active($state = true)
    {
        return $this->andWhere(['active' => $state ? 1 : 0]);
    }
}