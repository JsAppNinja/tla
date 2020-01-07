<?php

namespace frontend\modules\v1\models;

use Yii;


class SubTopic extends \common\models\Subtopic
{
    public function fields()
    {
        return [
            'id',
            'name',
            'topic_id',
        ];
    }
}