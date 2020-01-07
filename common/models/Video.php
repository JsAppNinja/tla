<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "video".
 *
 * @property integer $id
 * @property string $video_url
 * @property string $preview_img
 * @property string $iframe
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property TutorHelpVideo[] $tutorHelpVideos
 */
class Video extends \yii\db\ActiveRecord
{
    const VIDEO_AVAILABLE = 1;
    const VIDEO_TRANSCODING = 2;
    const VIDEO_ERROR = -1;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'video';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['created_at', 'updated_at'], 'integer'],
            [['video_url', 'preview_img', 'iframe'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'video_url' => 'Video Url',
            'preview_img' => 'Preview Img',
            'iframe' => 'Iframe',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutorHelpVideos()
    {
        return $this->hasOne(TutorHelpVideo::className(), ['video_id' => 'id']);
    }
}
