<?php

namespace frontend\modules\v1\models;

use DateTime;
use Yii;


class Billing extends \common\models\Billing
{
    public function fields()
    {
        return [
            'id',
            'status',
            'description',
            'amount',
            'subscription' => function() {
                return $this->subscription->plan;
            },
            'created_at' => function () {
                return DateTime::createFromFormat('U', $this->created_at)->format(DateTime::ISO8601);
            },
        ];
    }
}