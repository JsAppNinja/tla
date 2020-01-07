<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "tutor_video".
 *
 * @property integer $id
 * @property integer $tutor_id
 * @property integer $lesson_id
 * @property string $video_url
 *
 * @property Lesson $lesson
 * @property Tutor $tutor
 */
class TutorVideo extends \yii\db\ActiveRecord
{

    const VIDEO_AVAILABLE = 1;
    const VIDEO_TRANSCODING = 2;
    const VIDEO_ERROR = -1;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'tutor_video';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['tutor_id', 'lesson_id'], 'integer'],
            [['video_url', 'title', 'description'], 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'tutor_id' => 'Tutor ID',
            'lesson_id' => 'Lesson ID',
            'video_url' => 'Video Url',
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
    public function getTutor()
    {
        return $this->hasOne(Tutor::className(), ['id' => 'tutor_id']);
    }
}
