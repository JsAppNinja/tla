<?php

namespace common\models;

use frontend\modules\v1\models\Quize;
use Yii;

/**
 * This is the model class for table "essay".
 *
 * @property integer $id
 * @property string $content
 * @property string $correct_answer
 * @property integer $quize_id
 *
 * @property Exam $exam
 */
class Essay extends \yii\db\ActiveRecord
{
    public $imageable_type = Images::ESSAY;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'essay';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['content', 'correct_answer'], 'string'],
            [['quize_id'], 'required'],
            [['quize_id'], 'integer']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'content' => 'Content',
            'correct_answer' => 'Correct Answer',
            'quize_id' => 'Exam ID',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getExam()
    {
        return $this->hasOne(Quize::className(), ['id' => 'quize_id']);
    }
}
