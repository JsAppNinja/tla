<?php

namespace frontend\modules\v1\models;

use Yii;


class Lesson extends \common\models\Lesson
{
    public function fields()
    {
        return [
            'id',
            'title',
            'description',
            'subject_id',
            'sort',
            'created_at',
            'updated_at',
        ];
    }
}