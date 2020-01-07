<?php

namespace frontend\modules\v1\models;

use Yii;


class Examtype extends \common\models\Examtype
{
    public function fields()
    {
        return [
            'id',
            'name',
            'free',
            'active'
        ];
    }
}