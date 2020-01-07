<?php

namespace frontend\components;

use Yii;
use common\models\Online;
use yii\base\BootstrapInterface;
use yii\base\Component;

class onlineManager extends Component implements BootstrapInterface {
    public function bootstrap($app)
    {
        if (Yii::$app->user->isGuest) {
            return;
        }

        if (($model = Online::findOne(Yii::$app->user->identity->id)) !== null) {
            $model->datetime = date('Y-m-d H:i:s');
            $model->save();
        } else {
            $model = new Online([
                'uid' => Yii::$app->user->identity->id,
                'datetime' => date('Y-m-d H:i:s'),
            ]);
            $model->save();
        }
    }
}