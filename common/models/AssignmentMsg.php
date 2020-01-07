<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "assignment_msg".
 *
 * @property integer $id
 * @property string $body
 * @property integer $assignment_student_id
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property AssignmentStudent $assignmentStudent
 */
class AssignmentMsg extends \yii\db\ActiveRecord
{

    const OWNER_STUDENT = 0;
    const OWNER_TUTOR = 1;

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
        return 'assignment_msg';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['body'], 'string'],
            [['assignment_student_id'], 'required'],
            [['assignment_student_id', 'created_at', 'updated_at'], 'integer']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'body' => 'Body',
            'assignment_student_id' => 'Assignment Student ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAssignmentStudent()
    {
        return $this->hasOne(AssignmentStudent::className(), ['id' => 'assignment_student_id']);
    }
}
