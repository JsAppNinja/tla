<?php

namespace frontend\modules\v1\models;

use Yii;


class TutorHelpVideo extends \common\models\TutorHelpVideo
{
    public function fields()
    {
        return [
            'id',
            'active',
            'title',
            'description',
            'video',
        ];
    }
}