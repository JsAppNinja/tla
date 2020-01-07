<?php

namespace common\models;

use Yii;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "admin_video".
 *
 * @property integer $id
 * @property integer $user_id
 * @property integer $subject_id
 * @property string $video_url
 * @property string $title
 * @property string $description
 * @property string $preview_img
 * @property string $iframe
 * @property integer $status
 * @property integer $free
 *
 * @property SubjectOrigin $subject
 * @property User $user
 */
class AdminVideo extends \yii\db\ActiveRecord
{
    const VIDEO_AVAILABLE = 1;
    const VIDEO_TRANSCODING = 2;
    const VIDEO_ERROR = -1;

    const FREE_VIDEO = 1;
    const PAYED_VIDEO = 0;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'admin_video';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'subject_id', 'status', 'free', 'active'], 'integer'],
            [['description'], 'string'],
            [['video_url', 'title', 'preview_img', 'iframe'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'subject_id' => 'Subject ID',
            'video_url' => 'Video Url',
            'title' => 'Title',
            'description' => 'Description',
            'preview_img' => 'Preview Img',
            'iframe' => 'Iframe',
            'status' => 'Status',
            'free' => 'Free',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSubject()
    {
        return $this->hasOne(SubjectOrigin::className(), ['id' => 'subject_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::className(), ['id' => 'user_id']);
    }

    public static function getFreeVideosSubjects()
    {
        $result = ArrayHelper::getColumn(AdminVideo::find()->where(['free' => AdminVideo::FREE_VIDEO, 'active' => 1])->select('subject_id')->distinct()->asArray()->all(), 'subject_id');
        return SubjectOrigin::find()->where(['id' => $result])->all();
    }

    public static function getVideosSubjects()
    {
        $result = ArrayHelper::getColumn(AdminVideo::find()->where(['active' => 1])->select('subject_id')->distinct()->asArray()->all(), 'subject_id');
        return SubjectOrigin::find()->where(['id' => $result])->all();
    }
}
