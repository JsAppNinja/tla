<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "subject".
 *
 * @property integer $id
 * @property integer $subject_origin_id
 * @property integer $examtype_id
 *
 * @property Examtype $examtype
 * @property SubjectOrigin $subjectOrigin
 * @property Topic[] $topics
 */
class Subject extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'subject';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['subject_origin_id', 'examtype_id'], 'integer'],
            [['subject_origin_id','examtype_id'], 'required']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'subject_origin_id' => 'Subject Origin ID',
            'examtype_id' => 'Examtype ID',
        ];
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
    public function getSubjectOrigin()
    {
        return $this->hasOne(SubjectOrigin::className(), ['id' => 'subject_origin_id']);
    }

    public function getStudents()
    {
        return $this->hasMany(Student::className(), ['id' => 'student_id'])
            ->viaTable('subject_student', ['subject_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTopics()
    {
        return $this->hasMany(Topic::className(), ['subject_id' => 'id']);
    }

    public function getLessons()
    {
        return $this->hasMany(Lesson::className(), ['subject_id' => 'id']);
    }
}
