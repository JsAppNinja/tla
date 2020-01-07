<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\helpers\FileHelper;
use yii\web\UploadedFile;

/**
 * This is the model class for table "assignment_file".
 *
 * @property integer $id
 * @property string $name
 * @property string $origin_name
 * @property integer $file_type
 * @property integer $type
 * @property integer $assignment_id
 * @property integer $student_id
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property Assignment $assignment
 */
class AssignmentFile extends \yii\db\ActiveRecord
{
    const TUTOR_ASSIGNMENT = 0;
    const STUDENT_ASSIGNMENT = 1;

    /**
     * @var UploadedFile
     */
    public $file;

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
        return 'assignment_file';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['type', 'assignment_id', 'student_id', 'created_at', 'updated_at'], 'integer'],
            [['name', 'origin_name', 'file_type'], 'string', 'max' => 255],
            [['name', 'assignment_id', 'file_type', 'type', 'origin_name'], 'required'],
            [['file'], 'file', 'skipOnEmpty' => true, 'extensions' => 'png, jpg, docx, pdf, doc, txt, xls, xlsx'],
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
            'origin_name' => 'Origin Name',
            'file_type' => 'File Type',
            'type' => 'Type',
            'assignment_id' => 'Assignment ID',
            'student_id' => 'Student ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAssignment()
    {
        return $this->hasOne(Assignment::className(), ['id' => 'assignment_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getStudent()
    {
        return $this->hasOne(Student::className(), ['id' => 'student_id']);
    }

    public function upload()
    {
        $this->name = uniqid() .'.'. $this->file->extension;
        $this->file_type = $this->file->extension;
        $this->origin_name = $this->file->baseName;
        if($this->student_id) {
            $this->type = AssignmentFile::STUDENT_ASSIGNMENT;
        } else {
            $this->type = AssignmentFile::TUTOR_ASSIGNMENT;
        }

        if ($this->validate()) {
            $file_dir = Yii::$app->basePath .
                DIRECTORY_SEPARATOR .
                'web' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'assignments' . DIRECTORY_SEPARATOR . $this->assignment_id;
            FileHelper::createDirectory($file_dir);
            $this->file->saveAs($file_dir . DIRECTORY_SEPARATOR . $this->name);

            $this->save(false);

            return $this;
        } else {
            return $this->errors;
        }

    }
}
