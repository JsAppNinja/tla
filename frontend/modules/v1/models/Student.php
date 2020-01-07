<?php

namespace frontend\modules\v1\models;

use common\models\Subscription;
use DateTime;
use Yii;


class Student extends \common\models\Student
{
    public function fields()
    {
        return [
            'id',
            'first_name',
            'last_name',
            'avatar' => function () {
                return $this->getAvatarPath() . $this->avatar;
            },
            'avatar_original' => function () {
                return $this->getAvatarPath() . $this->avatar_original;
            },
            
        ];
    }
}