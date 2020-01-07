<?php

namespace common\models;

use frontend\modules\v1\models\SubscriptionPlan;
use Yii;

/**
 * This is the model class for table "plan_country".
 *
 * @property integer $plan_id
 * @property integer $country_id
 * @property string $price
 *
 * @property MmCountry $country
 * @property SubscriptionPlan $plan
 */
class PlanCountry extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'plan_country';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['plan_id', 'country_id'], 'required'],
            [['plan_id', 'country_id'], 'integer'],
            [['price'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'plan_id' => 'Plan ID',
            'country_id' => 'Country ID',
            'price' => 'Price',
        ];
    }

    public function getPlan() {
        return $this->hasOne(SubscriptionPlan::className(), ['id' => 'plan_id']);
    }

    public function getCountry() {
        return $this->hasOne(MmCountry::className(), ['id' => 'country_id']);
    }
}
