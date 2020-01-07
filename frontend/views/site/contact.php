<?php

/* @var $this yii\web\View */
/* @var $form yii\bootstrap\ActiveForm */
/* @var $model \frontend\models\ContactForm */

use kartik\form\ActiveForm;
use yii\bootstrap\Alert;
use yii\helpers\Html;
use yii\captcha\Captcha;

$this->title = 'Contact Us';
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="page-header">
    <h1><?= Html::encode($this->title) ?></h1>
</div>

<div class="col-xs-8">
    <?php
    $form = ActiveForm::begin([
        'id' => 'form-signup',
        'type' => ActiveForm::TYPE_HORIZONTAL,
        'formConfig' => [
            'labelSpan' => 4
        ]
    ]);

    echo $form->field($model, 'firstName', [
    ])->textInput(['placeholder' => 'Enter First Name...']);

    echo $form->field($model, 'middleName', [
    ])->textInput(['placeholder' => 'Enter Middle Name...']);

    echo $form->field($model, 'lastName', [
    ])->textInput(['placeholder' => 'Enter Last Name...']);

    echo $form->field($model, 'country', [
    ])->textInput(['placeholder' => 'Enter Country...']);

    echo $form->field($model, 'email', [
    ])->textInput(['placeholder' => 'Enter Email address...']);

    echo $form->field($model, 'phone', [
    ])->textInput(['placeholder' => 'Enter Phone...']);

    echo $form->field($model, 'reason', [
    ])->dropDownList([
        'Provide Feedback',
        'Make a Request',
        'Provide Information',
        'Business',
        'Sponsorship',
        'Accounts',
        'Report Misuse'
    ]);
    echo Html::submitButton('Send feedback', ['class' => 'btn btn-primary']);
    ActiveForm::end();
    ?>
</div>
