<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "tutor_help_video".
 *
 * @property integer $id
 * @property integer $video_id
 * @property integer $active
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property Video $video
 */
class TutorHelpVideo extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'tutor_help_video';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['video_id'], 'required'],
            [['title', 'description'], 'string', 'max' => 255],
            [['video_id', 'active', 'created_at', 'updated_at'], 'integer']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'video_id' => 'Video ID',
            'active' => 'Active',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getVideo()
    {
        return $this->hasOne(Video::className(), ['id' => 'video_id']);
    }
}
