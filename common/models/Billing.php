<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "billing".
 *
 * @property integer $id
 * @property integer $subscription_id
 * @property string $last_billing_date
 * @property string $next_billing_date
 * @property integer $status
 *
 * @property Subscription $subscription
 */
class Billing extends ActiveRecord
{

    const ERROR = 0;
    const SUCCESS = 1;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'billing';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['subscription_id'], 'required'],
            [['subscription_id', 'status'], 'integer'],
            [['date', 'description'], 'string'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'subscription_id' => 'Subscription ID',
            'date' => 'Date',
            'description' => 'Description',
            'status' => 'Status',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSubscription()
    {
        return $this->hasOne(Subscription::className(), ['id' => 'subscription_id']);
    }
}
