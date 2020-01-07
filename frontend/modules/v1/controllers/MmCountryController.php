<?php
namespace frontend\modules\v1\controllers;

use common\models\PlanCountry;
use common\models\SubscriptionPlan;
use frontend\modules\v1\models\MmCountry;
use Yii;
use yii\rest\ActiveController;

class MmCountryController extends ActiveController
{
    public $modelClass = 'frontend\modules\v1\models\MnCountry';

    public function verbs()
    {
        $verbs = [
            'get-country-price' => ['GET'],
            'get-mm-countries' => ['GET']
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['index']);
        return $actions;
    }

    public function actionIndex()
    {
        return MmCountry::find()->all();
    }

    public function actionUpdate()
    {
        $request = Yii::$app->request->getBodyParams();
        $country = MmCountry::findOne(['id' => $request['id']]);
        if($country->load($request, '') && $country->save()) {
            return $country;
        }
        return false;
    }

    public function actionGetMmCountries()
    {
        $countries = [];
        $country_price = PlanCountry::find()->where(['not', ['price' => null]])->groupBy('country_id')->all();
        foreach ($country_price as $cp) {
            $country = MmCountry::findOne(['id' => $cp->country_id]);
            $countries[] = $country;
        }
        return $countries;
    }

    public function actionDelete($id)
    {
        return MmCountry::deleteAll(['id' => $id]);
    }
    
    public function actionCreate()
    {
        $request = Yii::$app->request->getBodyParams();
        $model = new MmCountry();
        if ($model->load($request, '') && $model->save()) {
            return $model;
        }
        return false;
    }

}