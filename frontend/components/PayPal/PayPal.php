<?php
namespace frontend\components\PayPal;

use yii\base\component;

use \PayPal\Rest\ApiContext;
use \PayPal\Auth\OAuthTokenCredential;

class PayPal extends Component {

    public $client_id;
    public $client_secret;
    private $apiContext; // paypal's API context

    // override Yii's object init()
    function init() {
        $this->apiContext = new ApiContext(
            new OAuthTokenCredential($this->client_id, $this->client_secret)
        );
    }

    public function getContext() {
        return $this->apiContext;
    }
}