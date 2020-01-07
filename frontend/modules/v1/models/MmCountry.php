<?php

namespace frontend\modules\v1\models;

use common\models\PlanCountry;
use Yii;

class MmCountry extends \common\models\MmCountry
{
    public $price = null;
    public function fields()
    {
        return [
            'id',
            'name',
            'currency',
            'phones',
            'price'
        ];
    }
}