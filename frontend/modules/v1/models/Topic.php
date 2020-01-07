<?php

namespace frontend\modules\v1\models;

use Yii;


class Topic extends \common\models\Topic
{
    public function fields()
    {
        return [
            'id',
            'name',
            'subject_id',
        ];
    }
}