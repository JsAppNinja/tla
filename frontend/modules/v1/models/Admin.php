<?php

namespace frontend\modules\v1\models;

use common\models\Subscription;
use DateTime;
use Yii;


class Admin extends \common\models\User
{
    public function fields()
    {
        return [
            'id',
            'email',
            'created_at' => function () {
                return DateTime::createFromFormat('U', $this->created_at)->format(DateTime::ISO8601);
            },
        ];
    }
}