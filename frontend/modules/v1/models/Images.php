<?php

namespace frontend\modules\v1\models;

use Yii;


class Images extends \common\models\Images
{
    public function fields()
    {
        return [
            'id',
            'name',
            'imageable_type',
            'imageable_id'
        ];
    }
}