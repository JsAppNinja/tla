<?php

namespace frontend\modules\v1\models;

use common\models\PlanCountry;
use Yii;

class SubscriptionPlan extends \common\models\SubscriptionPlan
{
    public $countries;
    public $mm = false;

    public function fields()
    {
        return [
            'id',
            'name',
            'amount',
            'description',
            'students_count',
            'countries' => function () {
                $countriesArray = [];
                $planPrices = PlanCountry::find()->where(['plan_id' => $this->id])->all();
                $countries = MmCountry::find()->all();
                $count = 0;
                foreach ($countries as $country) {
                    foreach ($planPrices as $plan) {
                        if ($country->id == $plan->country_id) {
                            if ($plan->price) $count++;
                            $country->price = $plan->price;
                        }
                    }
                    $countriesArray[] = $country;
                }
                $this->mm = $count ? true : false;
                return $countriesArray;
            },
            'mm'
        ];
    }
}