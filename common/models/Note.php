<?php

namespace common\models;

use Yii;
use yii\helpers\FileHelper;
use yii\web\HttpException;
use yii\web\UploadedFile;

/**
 * This is the model class for table "note".
 *
 * @property integer $id
 * @property integer $lesson_id
 * @property integer $status
 * @property string $title
 * @property string $description
 * @property string $file_name
 * @property string $file_type
 * @property string $origin_file_name
 * @property string $file_path
 *
 * @property Lesson $lesson
 */
class Note extends \yii\db\ActiveRecord
{
    public $file;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'note';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['lesson_id'], 'required'],
            [['lesson_id', 'status'], 'integer'],
            [['description'], 'string'],
            [['title', 'file_name', 'file_type', 'origin_file_name', 'file_path'], 'string', 'max' => 255],
            [['file'], 'file', 'skipOnEmpty' => true, 'extensions' => 'pdf, docx, doc, xls, xlsx, ppt, pptx, txt, rtf', 'maxFiles' => 1],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'lesson_id' => 'Lesson ID',
            'status' => 'Status',
            'title' => 'Title',
            'description' => 'Description',
            'file_name' => 'File Name',
            'file_type' => 'File Type',
        ];
    }

    public function beforeSave($insert)
    {
        if ($insert) {
            if ($this->file && $this->validate(['file'])) {
                if (!$this->uploadNoteFile()) {
                    throw new HttpException('Error');
                }
            }
        }
        return parent::beforeSave($insert); // TODO: Change the autogenerated stub
    }

    private function uploadNoteFile()
    {
        $tutor = Tutor::findOne(['user_id' => $this->lesson->subject->examtype->user_id]);

        if (FileHelper::createDirectory(Yii::getAlias('@webroot') . $tutor->getTutorNotesPath())) {
            $fileName = uniqid() . '.' . $this->file->extension;
            if ($this->file->saveAs(Yii::getAlias('@webroot') . $tutor->getTutorNotesPath() . DIRECTORY_SEPARATOR . $fileName)) {
                $this->file_name = $fileName;
                $this->file_type = $this->file->extension;
                $this->origin_file_name = $this->file->name;
                $this->file_path = $tutor->getTutorNotesPath();
                return true;
            }
        }

        return false;
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getLesson()
    {
        return $this->hasOne(Lesson::className(), ['id' => 'lesson_id']);
    }
}