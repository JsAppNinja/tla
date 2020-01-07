<?php
use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $user common\models\User */

$resetLink = Yii::$app->urlManager->createAbsoluteUrl(['site/reset-password', 'token' => $user->password_reset_token]);
?>

<div class="welcome-msg">
    <p>Hello <?= Html::encode($user->first_name) ?> <?= Html::encode($user->last_name) ?>. </p>
    <p>You have successfully registered on PassGeek (Training/Learning Application) as a student.</p>
    <p>Follow the link to set the password for your account:</p>
    <p><?= Html::a(Html::encode($resetLink), $resetLink) ?></p>
</div>
