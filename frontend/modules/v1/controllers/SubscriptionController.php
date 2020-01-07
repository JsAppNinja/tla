<?php
namespace frontend\modules\v1\controllers;

use DateInterval;
use frontend\modules\v1\models\Subscription;
use Yii;
use yii\rest\ActiveController;

class SubscriptionController extends ActiveController
{
    public $modelClass = 'frontend\modules\v1\models\Subscription';

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['create'], $actions['index'], $actions['update'], $actions['delete'], $actions['view']);
        return $actions;
    }

    public function actionView($id) {
        return Subscription::findOne(['user_id' => $id]);
    }

    public function actionCreate()
    {
        $request = Yii::$app->request->getBodyParams();
        $subscription = Subscription::findOne(['user_id' => $request['user']['id']]);
        if(!$subscription) {
            $subscription = new Subscription();
        }
        $subscription->user_id = $request['user']['id'];
        $subscription->status = Subscription::MANUAL;
        $subscription->last_billing_date = (new \DateTime())->format(\DateTime::ISO8601);
        $subscription->next_billing_date = (new \DateTime())->add(new DateInterval('P' . $request['subscription']['month'] .'D'))->format(\DateTime::ISO8601);
        return $subscription->save();
    }

}