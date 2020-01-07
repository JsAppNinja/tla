<?php

namespace common\models;

use frontend\modules\v1\models\Student;
use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "chat".
 *
 * @property integer $id
 * @property integer $status
 * @property integer $createdBy_id
 * @property integer $created_at
 * @property integer $updated_at
 * @property integer $type
 *
 * @property User $createdBy
 * @property ChatMessage[] $messages
 * @property User[] $users
 * @property $lastVisit
 * @property $lastMessages
 */
class Chat extends \yii\db\ActiveRecord
{

    const PERMANENT = 0;
    const CUSTOM = 1;

    const STATUS_DELETED = 0;
    const STATUS_ACTIVE = 1;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'chat';
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['status', 'createdBy_id', 'created_at', 'updated_at'], 'integer'],
            [['createdBy_id'], 'required']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'status' => 'Status',
            'createdBy_id' => 'Created By ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCreatedBy()
    {
        return $this->hasOne(User::className(), ['id' => 'createdBy_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getMessages()
    {
        return $this->hasMany(ChatMessage::className(), ['chat_id' => 'id']);
    }

    public function getLastVisit()
    {
        return $this->hasOne(ChatUser::className(), ['chat_id' => 'id'])->where(['user_id' => Yii::$app->user->identity->id])->select('last_visit');
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUsers()
    {
        return $this->hasMany(User::className(), ['id' => 'user_id'])
            ->viaTable('chat_user', ['chat_id' => 'id']);
    }

    public function getTutorStudent()
    {
        return $this->hasOne(Student::className(), ['user_id' => 'user_id'])
            ->viaTable('chat_user', ['chat_id' => 'id']);
    }

    public function getUnreadMessagesCount()
    {

        $count = 0;

        foreach ($this->messages as $message) {
            if (($message->created_at > $this->lastVisit->last_visit) && ($message->sender_id != Yii::$app->user->identity->id)) {
                $count++;
            }
        }

        return $count;
    }

    public function getLastMessages($limit, $offset = 0)
    {
        return $this->hasMany(ChatMessage::className(), ['chat_id' => 'id'])
            ->orderBy('created_at DESC')
            ->limit($limit)
            ->offset($offset)
            ->all();
    }

    public function addMessage($body)
    {
        $message = new ChatMessage();

        $message->body = $body;
        $message->chat_id = $this->id;
        $message->sender_id = Yii::$app->user->identity->id;
        $message->save();

        return $message;
    }

    public function getOpponent() {
        return $this->hasOne(User::className(), ['id' => 'user_id'])->where(['<>','id', Yii::$app->user->identity->id])
            ->viaTable('chat_user', ['chat_id' => 'id']);
    }
}
