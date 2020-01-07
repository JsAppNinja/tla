<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "assignment".
 *
 * @property integer $id
 * @property string $name
 * @property string $description
 * @property integer $lesson_id
 *
 * @property Lesson $lesson
 * @property AssignmentFile[] $assignmentFiles
 */
class Assignment extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'assignment';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['description'], 'string'],
            [['lesson_id'], 'integer'],
            [['name'], 'string', 'max' => 255]
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
            'lesson_id' => 'Lesson ID',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getLesson()
    {
        return $this->hasOne(Lesson::className(), ['id' => 'lesson_id']);
    }
    
    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAssignmentFiles()
    {
        return $this->hasMany(AssignmentFile::className(), ['assignment_id' => 'id'])->where(['type' => AssignmentFile::TUTOR_ASSIGNMENT]);
    }

    public function getAssignmentStudentFiles()
    {
        return $this->hasMany(AssignmentFile::className(), ['assignment_id' => 'id'])->where(['type' => AssignmentFile::STUDENT_ASSIGNMENT]);
    }
}
