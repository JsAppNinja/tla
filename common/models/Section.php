<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "section".
 *
 * @property integer $id
 * @property string $description
 * @property integer $quiz_id
 *
 * @property Subject $subject
 */
class Section extends \yii\db\ActiveRecord
{
    public $imageable_type = Images::SECTION;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'section';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['description'], 'string'],
            [['quiz_id'], 'integer']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'description' => 'Description',
            'quiz_id' => 'Quiz ID',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getQuiz()
    {
        return $this->hasOne(Quize::className(), ['id' => 'quiz_id']);
    }

    public function getQuestions() {
        return $this->hasMany(Question::className(), ['section_id' => 'id']);
    }

    public function getImages() {
        return $this->hasMany(Images::className(), ['imageable_type' => 'imageable_type', 'imageable_id' => 'id']);
    }
}
