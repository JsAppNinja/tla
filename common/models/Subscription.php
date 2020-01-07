<?php

namespace common\models;

use DateTime;
use Yii;
use common\models\User;
/**
 * This is the model class for table "subscription".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $profile
 * @property string $start_date
 * @property integer $status
 *
 * @property User $user
 */
class Subscription extends \yii\db\ActiveRecord
{

    const CANCELED = 1;
    const PENDING = 2;
    const ACTIVE = 3;
    const MANUAL = 4;

    public $statuses = [
        self::CANCELED => 'Canceled',
        self::PENDING => 'Pending',
        self::ACTIVE => 'Active',
        self::MANUAL => 'Manual'
    ];


    public function getStatus()
    {
        return $this->statuses[$this->status];
    }
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'subscription';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'status'], 'integer'],
            [['start_date'], 'safe'],
            [['profile'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'status' => 'Status',
            'profile' => 'Profile',
            'start_date' => 'Start Date',
        ];
    }

    public function getBilling()
    {
        return $this->hasMany(Billing::className(), ['subscription_id' => 'id']);
    }

    public function getPlan()
    {
        return $this->hasOne(SubscriptionPlan::className(), ['id' => 'plan_id']);
    }

    public function checkSubscription($drop = false)
    {
        $endDate = new DateTime($this->next_billing_date);
        $currentDate = new DateTime();
        if($drop) {
            if($endDate < $currentDate) {
                return $this->cancelSubscription(Yii::$app->user->identity);
            }
        }
        return $endDate < $currentDate;
    }

    public function cancelSubscription($user)
    {
        $subscription = Subscription::findOne(['user_id' => $user->id]);
        $subscription->status = Subscription::CANCELED;
        return $subscription->save();
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::className(), ['id' => 'user_id']);
    }
}
