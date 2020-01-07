<?php

namespace frontend\modules\v1\models;

use DateTime;
use Yii;


class Assignment extends \common\models\Assignment
{
    public function fields()
    {
        return [
            'id',
            'name',
            'description',
            'assignmentFiles'
        ];
    }
}