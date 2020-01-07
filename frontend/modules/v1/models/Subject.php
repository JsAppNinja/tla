<?php

namespace frontend\modules\v1\models;

use Yii;


class Subject extends \common\models\Subject
{
    public function fields()
    {
        return [
            'id',
            'name' => function ($model){
                return $model->subjectOrigin->name;
            }
        ];
    }
}