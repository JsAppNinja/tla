<?php

namespace frontend\controllers;

use common\models\Billing;
use common\models\LoginForm;
use common\models\Student;
use common\models\Subscription;
use common\models\User;
use DateInterval;
use DateTime;
use frontend\models\ContactForm;
use frontend\models\SendLinkForm;
use frontend\components\purrwebRecurring\RecurringSubscription;
use Yii;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;
use yii\helpers\VarDumper;
use yii\rest\Controller;
use yii\web\NotFoundHttpException;
use common\models\SystemSetting;

class SubscriptionController extends \yii\web\Controller
{
    public $layout = 'student';

    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'send-link' => ['post']
                ]
            ]
        ];
    }

    public function actionIndex()
    {
        $model = Subscription::find()->all();
        return $this->render('index', compact('model'));
    }

    public function actionSendLink()
    {
        $request = Yii::$app->request->getBodyParams();

        $link = new SendLinkForm();
        if ($link->load($request) && $link->sendLink()) {
            Yii::$app->session->setFlash('success', 'Payment link was sent !');
        } else {
            Yii::$app->session->setFlash('error', 'Error !');
        }
        return $this->redirect(Yii::$app->request->referrer);
    }

    public function actionCancel()
    {
        $link = new SendLinkForm();

        return $this->render('buy', compact('link'));
    }

    public function actionSuccess($token)
    {
        $result = Yii::$app->payPalRecurring->GetExpressCheckoutDetails($token);
        $currentDate = new DateTime();

        $subscription = new RecurringSubscription();
        $subscription->PAYERID = $result['PAYERID'];
        $subscription->AMT = SystemSetting::student_monthly_amount();
        $subscription->BILLINGFREQUENCY = 1;
        $subscription->BILLINGPERIOD = RecurringSubscription::MONTH;
        if (isset($result['CUSTOM'])) {
            $user = User::findOne(['hash' => $result['CUSTOM']]);
            if ($user) {
                $subscription->DESC = "Subscription to https://passgeek.com for $" . SystemSetting::student_monthly_amount() . " per month Subscriber name: "
                    . $user->first_name . " "
                    . $user->last_name;
            } else {
                throw new HttpException(404, 'Page not found');
            }
        } else {
            $subscription->DESC = '$' . SystemSetting::student_monthly_amount() . ' per month';
        }
        $subscription->PROFILESTARTDATE = $currentDate->add(new DateInterval('P1M'))->format(DateTime::ISO8601);
        $subscription->INITAMT = $subscription->AMT;
        $subscription->FAILEDINITAMTACTION = 'CancelOnFailure';

        if ($result = Yii::$app->payPalRecurring->CreateRecurringPaymentsProfile($subscription)) {
            $s = new Subscription();
            $s->user_id = isset($user) ? $user->id : Yii::$app->user->id;
            $s->profile = $result['PROFILEID'];
            $s->start_date = $result['TIMESTAMP'];
            $s->status = Subscription::ACTIVE;
            $s->save();
        }

        return $this->goHome();
    }

    public function actionCheckout()
    {
        $request = Yii::$app->request->getBodyParams();
        $params = [
            'L_BILLINGAGREEMENTDESCRIPTION0' => '$' . SystemSetting::student_monthly_amount() . ' per month',
            'cancelUrl' => \Yii::$app->params['payPalCallbackUrl'] . '/cancel',
            'returnUrl' => \Yii::$app->params['payPalCallbackUrl'] . '/success'
        ];
        if (isset($request['user_hash'])) {
            $user = User::findOne(['hash' => $request['user_hash']]);
            $params['PAYMENTREQUEST_0_CUSTOM'] = $request['user_hash'];
            $params['L_BILLINGAGREEMENTDESCRIPTION0'] = "Subscription to https://passgeek.com for $" . SystemSetting::student_monthly_amount() . " per month Subscriber name: "
                . $user->first_name . " "
                . $user->last_name;
        }
        return $this->redirect(Yii::$app->payPalRecurring->SetExpressCheckout($params));
    }

    public function actionPay($user_hash)
    {
        $this->layout = 'newLayout';
        $login = new LoginForm();
        $contact = new ContactForm();

        if (!isset($this->view->params['login'])) $this->view->params['login'] = $login;
        if (!isset($this->view->params['contact'])) $this->view->params['contact'] = $contact;

        $this->view->params['numberOfTeachers'] = User::getNumberOfTeachers();
        $this->view->params['numberOfStudents'] = User::getNumberOfStudents();
        $this->view->params['numberOfSchools'] = User::getNumberOfSchools();

        if (strlen($user_hash) == 40) {
            $model = User::findOne(['hash' => $user_hash]);
            if ($model) {
                if ($model->isSubscribed() || $model->isPending()) {
                    return $this->render('subscribed', compact('model'));
                }
                return $this->render('pay', compact('model'));
            }
        }
        throw new NotFoundHttpException('Page not found');
    }

    public function actionBuy()
    {
        if (Yii::$app->user->identity->isSubscribed()) {
            return $this->redirect(Yii::$app->request->referrer);
        }
        if (Yii::$app->user->identity->isPending()) {
            return $this->render('pending');
        }

        $link = new SendLinkForm();

        return $this->render('buy', compact('link'));
    }
}
