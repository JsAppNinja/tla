<?php
namespace frontend\modules\v1\controllers;

use frontend\modules\v1\models\SystemSetting;
use Yii;
use yii\rest\ActiveController;

class SystemSettingsController extends ActiveController
{
    public $modelClass = 'frontend\modules\v1\models\SystemSetting';

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['index']);
        return $actions;
    }

    public function verbs()
    {
        $verbs = [
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actionIndex()
    {
        return SystemSetting::find()->all();
    }

    public function actionUpdate()
    {
        $request = Yii::$app->request->getBodyParams();

        return SystemSetting::updateAll($request);
    }

}