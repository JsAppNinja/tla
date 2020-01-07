<?php

namespace frontend\modules\v1\models;

use common\models\Subscription;
use DateTime;
use Yii;


class User extends \common\models\User
{
    public function fields()
    {
        return [
            'id',
            'first_name',
            'last_name',
            'created_at' => function () {
                return DateTime::createFromFormat('U', $this->created_at)->format(DateTime::ISO8601);
            },
            'subscribed' => function () {
                return Subscription::find()->where(['user_id' => $this->id, 'status' => Subscription::ACTIVE])->orWhere(['user_id' => $this->id, 'status' => Subscription::MANUAL])->one() ? true : false;
            },
            'plan' => function() {
                if($this->subscription) {
                    return $this->subscription->plan;
                }
            },
            'email',
            'user_type',
            'deleted' => function () {
                return $this->delete_time ? true : false;
            },
            'delete_time'
        ];
    }
}