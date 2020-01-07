<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 01.03.16
 * Time: 10:03
 */

namespace frontend\modules\v1\controllers;

use common\models\Billing;
use common\models\Subscription;
use DateTime;
use yii\rest\Controller;

class HooksController extends Controller
{
    const PROFILE_CANCELED = "recurring_payment_profile_cancel";
    const PROFILE_CREATED = "recurring_payment_profile_created";
    const PAYMENT_FAILS = "recurring_payment_failed";
    const PAYED = "recurring_payment";

    public function verbs()
    {
        $verbs = [
            'hooks' => ['POST'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actionHooks()
    {
        parse_str(urldecode(\Yii::$app->request->getRawBody()), $result);
        $string = '';
        foreach ($result as $key => $item) {
            $string .= $key . ': ' . $item . "\n";
        }
        if(isset($result['txn_type'])) {
            switch($result['txn_type']) {
                case self::PROFILE_CREATED:

                    $subscription = Subscription::findOne(['profile' => $result['recurring_payment_id']]);
                    $last_billing_date = new DateTime();
                    $next_billing_date = new DateTime();
                    date_timestamp_set($last_billing_date, strtotime($result['time_created']));
                    date_timestamp_set($next_billing_date, strtotime($result['next_payment_date']));
                    $subscription->last_billing_date = $last_billing_date->format(DateTime::ISO8601);
                    $subscription->next_billing_date = $next_billing_date->format(DateTime::ISO8601);
                    $subscription->status = Subscription::ACTIVE;
                    $subscription->save();

                    $billing = new Billing();
                    $billing->subscription_id = $subscription->id;
                    if($subscription->user->user_type == \common\models\User::TYPE_STUDENT) {
                        $billing->description = 'Payment successfully received in amount of $';
                    } else {
                        $billing->description = 'Payment successfully received in amount of $' . $subscription->plan->amount . ' for '. $subscription->plan->name;
                    }
                    $billing->status = Billing::SUCCESS;
                    $billing->date = $last_billing_date->format(DateTime::ISO8601);
                    $billing->save();

                    break;
                case self::PAYED:
                    $last_billing_date = new DateTime();
                    $next_billing_date = new DateTime();
                    date_timestamp_set($last_billing_date, strtotime($result['payment_date']));
                    date_timestamp_set($next_billing_date, strtotime($result['next_payment_date']));

                    $subscription = Subscription::findOne(['profile' => $result['recurring_payment_id']]);
                    $subscription->last_billing_date = $last_billing_date->format(DateTime::ISO8601);
                    $subscription->next_billing_date = $next_billing_date->format(DateTime::ISO8601);
                    $subscription->save();

                    $billing = new Billing();
                    $billing->subscription_id = $subscription->id;
                    if($subscription->user->user_type == \common\models\User::TYPE_STUDENT) {
                        $billing->description = 'Payment successfully received in amount of $';
                    } else {
                        $billing->description = 'Payment successfully received in amount of $' . $subscription->plan->amount . ' for '. $subscription->plan->name;
                    }
                    $billing->status = Billing::SUCCESS;
                    $billing->date = $last_billing_date->format(DateTime::ISO8601);
                    $billing->save();

                    break;
                case self::PAYMENT_FAILS:
                    Subscription::updateAll([
                        'status' => Subscription::PENDING
                    ], [
                        'profile' => $result['recurring_payment_id'],
                    ]);
                    break;
                case self::PROFILE_CANCELED:
                    Subscription::updateAll([
                        'status' => Subscription::CANCELED
                    ], [
                        'profile' => $result['recurring_payment_id'],
                    ]);
                    break;
                default:
                    break;
            }
        }

        return true;
    }
}