<?php

/* @var $this yii\web\View */
/* @var $form yii\bootstrap\ActiveForm */
/* @var $model \frontend\models\SignupForm */

use kartik\dropdown\DropdownX;
use kartik\form\ActiveForm;
use yii\helpers\Html;
use kartik\date\DatePicker;

$this->title = 'Signup';
$request = Yii::$app->request->getQueryParams();
if (isset($request['data'])) {
    $auth_data = $request['data'];
    $model->email = isset($auth_data['email']) ? $auth_data['email'] : '';
    $model->firstName = isset($auth_data['firstName']) ? $auth_data['firstName'] : '';
    $model->lastName = isset($auth_data['lastName']) ? $auth_data['lastName'] : '';
    $model->social_id = isset($auth_data['social_id']) ? $auth_data['social_id'] : '';
}
?>
<section class="blue-half-bg"></section>
<section class="container-fluid">
    <div class="container main-container">
        <div class="row">
            <div class="col-xs-12">
                <?php ?>

                <h1 class="text-center">SignUp</h1>

                <div class="signUpWrapper col-md-4 col-md-offset-4">
                    <?php $form = ActiveForm::begin([
                        'id' => 'signup-form',
                    ]); ?>
                    <?= $form->field($model, 'userType')->dropDownList($model->userTypes)->label(false); ?>
                    <?= $form->field($model, 'email')->textInput(['placeholder' => 'E-mail', 'class' => 'form-control'])->label(false);; ?>
                    <?= $form->field($model, 'firstName')->textInput(['placeholder' => 'First name', 'class' => 'form-control'])->label(false); ?>
                    <?= $form->field($model, 'lastName')->textInput(['placeholder' => 'Last name', 'class' => 'form-control'])->label(false); ?>
                    <?= $form->field($model, 'sex')->radioList($model->sexs)->label(false); ?>
                    <?= $form->field($model, 'dateOfBirth')->textInput(['placeholder' => 'Date of Birth'])->label('Date of birth'); ?>
                    <?= Html::submitButton('Sign In', ['class' => 'btn button-big']) ?>
                    <?php if (isset($auth_data)): ?>
                        <?= $form->field($model, 'social_id')->hiddenInput()->label(false); ?>
                    <?php endif; ?>
                    <?php $form->end(); ?>
                </div>
            </div>
        </div>
    </div>
</section>