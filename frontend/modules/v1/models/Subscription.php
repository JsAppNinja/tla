<?php

namespace frontend\modules\v1\models;

use Yii;

class Subscription extends \common\models\Subscription
{
    public function fields()
    {
        return [
            'id',
            'user' => function() {
                return $this->user;
            },
            'profile',
            'start_date',
            'status' => function() {
                return $this->getStatus();
            },
            'plan' => function() {
                return $this->plan;
            },
            'last_billing_date',
            'next_billing_date',
            'billing_cycle' => function() {
                return $this->billing;
            }
        ];
    }
}