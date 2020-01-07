<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 09.03.16
 * Time: 12:22
 */

namespace common\behaviors;

use common\models\SystemSetting;
use yii;
use yii\base\Behavior;
use yii\base\Controller;

class CheckDeactivated extends Behavior
{
    public function events()
    {
        return [
            Controller::EVENT_BEFORE_ACTION => 'beforeAction'
        ];
    }

    public function beforeAction()
    {
        if(Yii::$app->user->identity->delete_time) {
            if(Yii::$app->getRequest()->url !== '/tutor/deactivated') {
                return Yii::$app->controller->redirect(['/tutor/deactivated']);
            }
        }
   }
}