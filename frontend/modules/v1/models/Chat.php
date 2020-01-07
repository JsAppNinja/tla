<?php

namespace frontend\modules\v1\models;

use DateTime;
use Yii;


class Chat extends \common\models\Chat
{
    public function fields()
    {
        return [
            'id',
            'users' => function() {
                return $this->users;
            },
            'messages',
            'status',
            'created_at'
        ];
    }
}