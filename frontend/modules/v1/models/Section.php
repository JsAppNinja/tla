<?php

namespace frontend\modules\v1\models;

use Yii;


class Section extends \common\models\Section
{
    public function fields()
    {
        return [
            'id',
            'description',
            'quiz_id',
            'questions' => function() {
                return $this->questions;
            }
        ];
    }
}