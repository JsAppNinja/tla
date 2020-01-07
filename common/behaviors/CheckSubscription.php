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

class CheckSubscription extends Behavior
{
    public $active = false;

    public function events()
    {
        return [
            Controller::EVENT_BEFORE_ACTION => 'beforeAction'
        ];
    }

    public function beforeAction()
    {
        $this->active = SystemSetting::payment_enabled();
        if ($this->active) {
            if(Yii::$app->getRequest()->url !== '/tutor/deactivated') {
                if(Yii::$app->user->identity->isTeacher()) {
                    if (Yii::$app->user->identity->isPending() && Yii::$app->getRequest()->url !== '/tutor/pending') {
                        return Yii::$app->controller->redirect(['/tutor/pending']);
                    }
                    if (!Yii::$app->user->identity->isPending() && !Yii::$app->user->identity->isSubscribed() && Yii::$app->getRequest()->url !== '/tutor/subscription') {
                        return Yii::$app->controller->redirect(['/tutor/subscription']);
                    }
                    if(Yii::$app->user->identity->isSubscribed() && (Yii::$app->getRequest()->url == '/tutor/subscription' || Yii::$app->getRequest()->url == '/tutor/pending') ) {
                        return Yii::$app->controller->redirect(['/tutor']);
                    }
                }
            }
        }
    }
}