<?php

namespace frontend\components;

use yii\authclient\clients\Facebook;

class CustomFacebook extends Facebook
{
    /**
     * @inheritdoc
     */
    protected function initUserAttributes()
    {
        return $this->api('me?fields=id,name,email,first_name,last_name', 'GET');
    }

}
