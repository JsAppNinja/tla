<?php

namespace frontend\modules\v1\models;

use Yii;


class Note extends \common\models\Note
{
    public function fields()
    {
        return [
            'id',
            'status',
            'title',
            'description',
            'origin_file_name',
            'file_name',
            'file_path'
        ];
    }
}