<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 06.04.16
 * Time: 16:11
 */
namespace frontend\components\Helpers;

use common\models\User;
use Mixpanel;
use Yii;
use yii\base\Component;

class MixPanelHelper extends Component{

    private $_token;
    private $_mp;
    private $_identity;
    private $_user;
    private $_active;
    public  $api_key;


    public function __construct(User $user = null)
    {
        $this->_active = Yii::$app->params['mixpanel_active'];
        if($this->_active) {
            $this->_token = Yii::$app->params['mixpanel_key'];
            $this->_user = $user;
            $this->_mp = Mixpanel::getInstance($this->_token);
            $this->_identity = Yii::$app->session->getId();
            if(!is_null($this->_user)) {
                $this->_mp->identify($this->_user->id);
                $this->_mp->people->set($this->_user->id, array(
                    '$first_name' => $this->_user->first_name,
                    '$last_name' => $this->_user->last_name,
                    '$email' => $this->_user->email,
                    '$user_type' => $this->_user->getUserType(),
                ));
            } else {
                $this->_mp->identify($this->_identity);
            }
        }

        return $this;
    }

    public function setAlias()
    {
        if($this->_active) {
            if (!is_null($this->_user)) {
                $this->_mp->createAlias($this->_identity, $this->_user->id);
            }
        }
        return $this;
    }

    public function track($event, $properties = [])
    {
        if($this->_active) {
            $this->_mp->track($event, $properties);
        }
    }
}