<?php

namespace frontend\modules\v1\models;

use Yii;


class Quize extends \common\models\Answer
{
    public function fields()
    {
        return [
            'id',
            'content',
            'correct',
            'question_id'
        ];
    }
}