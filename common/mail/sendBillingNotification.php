<?php
use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $user common\models\User */

?>

<div class="welcome-msg">
    <p>Hello <?= Html::encode($user->first_name) ?> <?= Html::encode($user->last_name) ?>. </p>
    <p>You have successfully payed <?= $billing->subscription->plan->name ?> on PassGeek (Training/Learning Application) in amount of $<?= $billing->subscription->plan->amount ?></p>
    <p>Billing period: <?= $billing->subscription->last_billing_date ?> to <?= $billing->subscription->next_billing_date ?></p>
</div>
