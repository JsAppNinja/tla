<?php
namespace frontend\controllers;

use common\models\LoginForm;
use common\models\Subscription;
use common\models\SubscriptionPlan;
use common\models\SystemSetting;
use common\models\User;
use DateInterval;
use DateTime;
use frontend\models\ContactForm;
use frontend\components\purrwebRecurring\RecurringSubscription;
use Yii;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;
use yii\helpers\VarDumper;
use yii\rest\Controller;
use yii\web\NotFoundHttpException;

class TutorSubscriptionController extends \yii\web\Controller
{
    public $layout = 'tutor';

    public function behaviors()
    {
        return [
            'CheckSubscription' => [
                'class' => 'common\behaviors\CheckSubscription',
                'active' => false
            ],
        ];
    }

    public function actionSuccess($token)
    {
        $result = Yii::$app->payPalRecurring->GetExpressCheckoutDetails($token);

        $currentDate = new DateTime();
        $subscriptionPlan = SubscriptionPlan::findOne($result['CUSTOM']);

        $subscription = new RecurringSubscription();
        $subscription->PAYERID = $result['PAYERID'];
        $subscription->AMT = $subscriptionPlan->amount;
        $subscription->BILLINGFREQUENCY = 1;
        $subscription->BILLINGPERIOD = RecurringSubscription::MONTH;
        $subscription->DESC = $subscriptionPlan->description ? $subscriptionPlan->description : 'No description';
        $subscription->PROFILESTARTDATE = $currentDate->add(new DateInterval('P1M'))->format(DateTime::ISO8601);
        $subscription->INITAMT = $subscriptionPlan->amount;
        $subscription->FAILEDINITAMTACTION = 'CancelOnFailure';

        if ($result = Yii::$app->payPalRecurring->CreateRecurringPaymentsProfile($subscription)) {
            $s = new Subscription();
            $s->user_id = isset($user) ? $user->id : Yii::$app->user->id;
            $s->profile = $result['PROFILEID'];
            $s->start_date = $result['TIMESTAMP'];
            $s->status = SystemSetting::without_pending() ? Subscription::ACTIVE : Subscription::PENDING;
            $s->plan_id = $subscriptionPlan->id;
            $s->save();
        }

        return $this->redirect('/');
    }

    public function actionPending()
    {
        $this->layout = 'tutor_unsubscribe';
        return $this->render('/tutor/pending');
    }

    public function actionCancel()
    {
        $this->layout = 'tutor_unsubscribe';
        $model = SubscriptionPlan::find()->all();
        return $this->render('/tutor/subscription', compact('model'));

    }

    public function actionCheckout()

    {
        $request = Yii::$app->request->getBodyParams();

        $subscriptionPlan = SubscriptionPlan::findOne($request['plan_id']);
        $params = [
            'L_BILLINGAGREEMENTDESCRIPTION0' => $subscriptionPlan->description ? $subscriptionPlan->description : 'No description',
            'cancelUrl' => \Yii::$app->params['payPalCallbackUrl'].'/tutor/cancel',
            'returnUrl' => \Yii::$app->params['payPalCallbackUrl'].'/tutor/success',
            'PAYMENTREQUEST_0_CUSTOM' => $subscriptionPlan->id,
        ];
        return $this->redirect(Yii::$app->payPalRecurring->SetExpressCheckout($params));
    }
}
