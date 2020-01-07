<?php

/* @var $this yii\web\View */
/* @var $form yii\bootstrap\ActiveForm */
/* @var $model \frontend\models\SignupForm */

use kartik\dropdown\DropdownX;
use yii\helpers\Html;
use kartik\form\ActiveForm;
use kartik\date\DatePicker;

$this->title = 'Signup';
?>

<div class="site-signup">
    <h3><?= Html::encode($this->title) ?> as </h3>


    <div class="dropdown">
        <button class="btn btn-default dropdown-toggle user-type-btn" type="button" id="dropdownMenu1"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            <span id="active-user-type"> Student </span>
            <span class="caret"></span>
        </button>
        <ul id="user-type-menu" class="dropdown-menu" aria-labelledby="dropdownMenu1">
            <li><a id="student-item" href="#">Student</a></li>
            <li><a id="teacher-item" href="#">Teacher</a></li>
        </ul>
    </div>


    <div class="uform student-form">
        <?php $form = ActiveForm::begin([
            'options' => ['class' => ['user-form']],
        ]) ?>

        <div class="first-name pull-left">
            <?= $form->field($model, 'firstName')->textInput(['placeholder' => 'First Name'])->label(false); ?>
        </div>

        <div class="last-name pull-left">
            <?= $form->field($model, 'lastName')->textInput(['placeholder' => 'Last Name'])->label(false); ?>
        </div>

        <div class="clearfix"></div>

        <div class="sex pull-left">
            <div class="dropdown class">
                <button class="btn btn-default sex-btn dropdown-toggle" type="button" id="dropdownMenu2"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <span id="active-sex"> Sex </span>
                    <span class="caret"></span>
                </button>
                <ul id="sex-menu" class="dropdown-menu" aria-labelledby="dropdownMenu2">
                    <li><a href="#">Male</a></li>
                    <li><a href="#">Female</a></li>
                </ul>
            </div>
            <div class="hidden">
                <?= $form->field($model, 'sex')->textInput()->label(false); ?>
            </div>
        </div>

        <div class="date-of-birth pull-left">
            <?= $form->field($model, 'dateOfBirth')->widget(kartik\date\DatePicker::className(), [
                'name' => 'dp_1',
                'type' => DatePicker::TYPE_INPUT,
                'value' => '23-Feb-1982',
                'convertFormat' => true,
                'pluginOptions' => [
                    'autoclose' => true,
                    'format' => 'dd-MM-yyyy'
                ]
            ])->textInput(['placeholder' => 'Date of Birth'])->label(false); ?>
        </div>

        <div class="clearfix"></div>

        <div class="form-group valign-top">
            <?= Html::submitButton('Next', ['class' => 'btn btn-primary sign-up-btn']) ?>
        </div>


        <div class="hidden">
            <?= $form->field($model, 'userType')->textInput(['value' => 'Student']); ?>
        </div>

        <?php ActiveForm::end() ?>
    </div>

    <div class="uform teacher-form hidden">
        <?php $form = ActiveForm::begin([
            'options' => ['class' => ['user-form']],
        ]) ?>


        <div class="first-name pull-left">
            <?= $form->field($model, 'firstName')->textInput(['placeholder' => 'First Name']); ?>
        </div>

        <div class="last-name pull-left">
            <?= $form->field($model, 'lastName')->textInput(['placeholder' => 'Last Name']); ?>
        </div>

        <div class="clearfix"></div>

        <div class="form-group valign-top">
            <?= Html::submitButton('Next', ['class' => 'btn btn-primary sign-up-btn']) ?>
        </div>

        <div class="hidden">
            <?= $form->field($model, 'userType')->textInput(['value' => 'Teacher']); ?>
        </div>
        <?php ActiveForm::end() ?>
    </div>
</div>
