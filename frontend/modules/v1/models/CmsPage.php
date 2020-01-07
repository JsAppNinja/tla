<?php

namespace frontend\modules\v1\models;

use Yii;


class CmsPage extends \common\models\CmsPage
{
    public function fields()
    {
        return [
            'id',
            'name',
            'title'
        ];
    }
}