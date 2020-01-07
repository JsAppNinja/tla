<?php
namespace frontend\modules\v1\controllers;

use DateInterval;
use stdClass;
use Yii;
use yii\rest\ActiveController;

class BillingController extends ActiveController
{
    public $modelClass = 'frontend\modules\v1\models\Billing';

    public function verbs()
    {
        $verbs = [
            'billing-cycle' => ['GET'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['create'], $actions['index'], $actions['update'], $actions['delete'], $actions['view']);
        return $actions;
    }

    public function actionBillingCycle() {
        $current_user = Yii::$app->user->identity;

        $billing_cycle = $current_user->subscription->billing;
        $result = new StdClass;
        $result->billing_cycles = $billing_cycle;
        $result->subscription = $current_user->subscription;

        return $result;
    }


}