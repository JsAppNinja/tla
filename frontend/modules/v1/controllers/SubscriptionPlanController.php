<?php
namespace frontend\modules\v1\controllers;

use common\models\PlanCountry;
use frontend\modules\v1\models\SubscriptionPlan;
use Yii;
use yii\rest\ActiveController;

class SubscriptionPlanController extends ActiveController
{
    public $modelClass = 'frontend\modules\v1\models\SubscriptionPlan';

    public function verbs()
    {
        $verbs = [
            'get-price' => ['GET'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['create'], $actions['index'], $actions['update'], $actions['delete']);
        return $actions;
    }

    public function actionIndex()
    {
        return SubscriptionPlan::find()->all();
    }

    public function actionCreate()
    {
        $request = Yii::$app->request->getBodyParams();

        $countries = isset($request['countries'])?$request['countries']:[];

        $subscriptionPlan = new SubscriptionPlan();
        $subscriptionPlan->load($request, '');

        if ($subscriptionPlan->save()) {
            foreach ($countries as $country) {
                $pc = new PlanCountry();
                $pc->plan_id = $subscriptionPlan->id;
                $pc->country_id = $country['id'];
                $pc->price = isset($country['price']) ? $country['price'] : null;
                $pc->save();
            }
        }

        return $subscriptionPlan;
    }

    public function actionUpdate()
    {
        $request = Yii::$app->request->getBodyParams();
        $countries = $request['countries'];

        if ($subscriptionPlan = SubscriptionPlan::findOne($request['id'])) {
            if ($subscriptionPlan->load($request, '')) {
                if ($subscriptionPlan->save()) {
                    foreach ($countries as $country) {
                        $pc = PlanCountry::findOne(['plan_id' => $subscriptionPlan->id, 'country_id' => $country['id']]);
                        if ($pc) {
                            PlanCountry::updateAll(['price' => $country['price'] ? $country['price'] : null], ['plan_id' => $subscriptionPlan->id, 'country_id' => $country['id']]);
                        } else {
                            $pc = new PlanCountry();
                            $pc->price = $country['price'] ? $country['price'] : null;
                            $pc->country_id = $country['id'];
                            $pc->plan_id = $subscriptionPlan->id;
                            $pc->save();
                        }
                    }
                }
                return $subscriptionPlan;
            }
        }

        return false;
    }

    public function actionGetPrice($id)
    {
        return PlanCountry::find()->where(['plan_id' => $id])->all();
    }

    public function actionDelete($id)
    {
        return SubscriptionPlan::deleteAll(['id' => $id]);
    }
}