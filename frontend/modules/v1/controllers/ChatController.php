<?php
namespace frontend\modules\v1\controllers;

use common\models\ChatUser;
use common\models\Online;
use common\models\Tutor;
use common\models\User;
use frontend\modules\v1\models\Chat;
use frontend\modules\v1\models\Student;
use HttpException;
use Yii;
use yii\helpers\ArrayHelper;
use yii\rest\ActiveController;

class ChatController extends ActiveController
{
    private $user;
    public $modelClass = 'frontend\modules\v1\models\Chat';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'get-messages' => ['GET'],
            'send-message' => ['POST'],
            'get-students' => ['GET'],
            'get-tutors' => ['GET'],
            'get-unreaded' => ['GET'],
            'get-chats' => ['GET'],
            'check-messages' => ['GET'],
            'create-chat' => ['POST'],
            'remove-chat' => ['POST'],
            'get-last-messages' => ['GET'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update']);
        return $actions;
    }

    public function actionGetMessages($id)
    {
        $response = [];

        $chat = Chat::findOne($id);

        $messages = $chat->getLastMessages(10);

        ArrayHelper::multisort($messages, 'id', SORT_ASC);

        foreach ($messages as $message) {
            $sender = $message->sender->getUserTypeInstance();

            $item = [];
            $item['body'] = $message->body;
            $item['created_at'] = $message->created_at;
            $item['sender'] = $sender->getFullName();
            $item['owner'] = $message->sender_id == $this->user->id ? 1 : 0;
            $item['isNew'] = !$item['owner'] && ($message->created_at > $chat->lastVisit->last_visit) ? 1 : 0;

            $response[] = $item;
        }

        $a = ChatUser::findOne(['chat_id' => $id, 'user_id' => $this->user->id]);
        $a->last_visit = time();

        $a->save();

        return $response;
    }

    public function actionSendMessage()
    {
        $request = Yii::$app->request->getBodyParams();

        $chat = Chat::findOne($request['chat_id']);

        if ($message = $chat->addMessage($request['message'])) {
            $sender = $message->sender->getUserTypeInstance();

            $response['body'] = $message->body;
            $response['created_at'] = $message->created_at;
            $response['sender'] = $sender->getFullName();
            $response['owner'] = $message->sender_id == $this->user->id ? 1 : 0;

            return $response;
        }

        throw new HttpException('Error');
    }

    public function actionCheckMessages($id)
    {
        $chat = Chat::findOne($id);

        $response = [];
        foreach ($chat->messages as $message) {
            if ($message->sender_id != $this->user->id) {
                if ($message->created_at > $chat->lastVisit->last_visit) {
                    $sender = $message->sender->getUserTypeInstance();

                    $item = [];
                    $item['body'] = $message->body;
                    $item['created_at'] = $message->created_at;
                    $item['sender'] = $sender->getFullName();
                    $item['owner'] = 0;
                    $item['isNew'] = 0;

                    $response[] = $item;

                    $a = ChatUser::findOne(['chat_id' => $id, 'user_id' => $this->user->id]);
                    $a->last_visit = time();

                    $a->save();
                }
            }
        }

        return $response;
    }

    public function actionGetChats()
    {
        $response = [];

        foreach ($this->user->chats as $chat) {
            if ($chat->status == Chat::STATUS_ACTIVE) {
                $item = [];
                $chatUser = [];

                $avatar = null;

                $user = User::findOne($chat->opponent->id);

                if($user->user_type == User::TYPE_TEACHER) {
                    $chatUser = Tutor::find()->where(['user_id' => $chat->opponent->id])->select(['first_name', 'last_name', 'avatar', 'id'])->one();
                    if($chatUser->avatar) {
                        $avatar = '/uploads/avatars/tutors/'.$chatUser->id.DIRECTORY_SEPARATOR.$chatUser->avatar;
                    }
                }
                if($user->user_type == User::TYPE_STUDENT) {
                    $chatUser = $user->getUserTypeInstance();
                    if($chatUser->avatar) {
                        $avatar = '/uploads/avatars/students/'.$chatUser->id.DIRECTORY_SEPARATOR.$chatUser->avatar;
                    }
                }
                $online = Online::findOne($chat->opponent->id);

                $isOnline = false;

                if($online) {
                    $lastVisit = new \DateTime($online->datetime);
                    $now = new \DateTime();
                    $diffInSeconds = $now->getTimestamp() - $lastVisit->getTimestamp();

                    if($diffInSeconds < 60) {
                        $isOnline = true;
                    }
                }

                $item['user_type'] = $user->user_type;
                $item['user'] = $chatUser;
                $item['online'] = $isOnline;
                $item['avatar'] = $avatar;
                $item['type'] = $chat->type;
                $item['unreadCount'] = $chat->unreadMessagesCount;
                $item['chat_id'] = $chat->id;
                $response['users'][] = $item;
            }
        }

        return $response;
    }

    public function actionCreateChat()
    {

        $request = Yii::$app->request->getBodyParams();

        $chatUser = User::findOne($request['user_id']);

        foreach ($this->user->chats as $chat) {
            if (($chat->opponent->id == $chatUser->id) && ($chat->status == Chat::STATUS_DELETED)) {
                $chat->status = Chat::STATUS_ACTIVE;
                $chat->save();
                return true;
            }
        }

        $chat = new Chat();
        $chat->createdBy_id = $this->user->id;
        $chat->type = Chat::CUSTOM;
        $chat->status = Chat::STATUS_ACTIVE;
        $chat->save();

        $chat->link('users', $this->user);
        $chat->link('users', $chatUser);

        return true;
    }

    public function actionGetLastMessages()
    {
        $request = Yii::$app->request->getQueryParams();

        $chat_id = $request['chat_id'];
        $count = $request['count'];

        $response = [];


        $chat = Chat::findOne($chat_id);

        $messages = $chat->getLastMessages(10, $count);


        foreach ($messages as $message) {
            $sender = $message->sender->getUserTypeInstance();
            $item = [];
            $item['body'] = $message->body;
            $item['created_at'] = $message->created_at;
            $item['sender'] = $sender->getFullName();
            $item['owner'] = $message->sender_id == $this->user->id ? 1 : 0;
            $item['isNew'] = !$item['owner'] && ($message->created_at > $chat->lastVisit->last_visit) ? 1 : 0;

            $response[] = $item;
        }

        return $response;
    }

    public function actionRemoveChat()
    {

        $request = Yii::$app->request->getBodyParams();

        $chatUser = User::findOne($request['user_id']);

        foreach ($this->user->chats as $chat) {
            if (($chat->opponent->id == $chatUser->id) && ($chat->type == Chat::CUSTOM)) {
                $chat->status = Chat::STATUS_DELETED;
                $chat->save();
                return $chat->id;
            }
        }

        return true;
    }
}