<?php

namespace frontend\modules\v1\models;

use Yii;


class CmsPageContent extends \common\models\CmsPageContent
{
    public function fields()
    {
        return [
            'id',
            'name',
            'content',
            'page_id'
        ];
    }
}