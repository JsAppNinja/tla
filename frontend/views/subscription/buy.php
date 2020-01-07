<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 03.03.16
 * Time: 15:19
 */
use kartik\form\ActiveForm;
use yii\bootstrap\Html;
use yii\helpers\Url;

?>
<a href="<?= Url::toRoute('student/practice-exam') ?>">Back to quizzes list</a>
<div class="page-header">
    <h2>Subscription</h2>
</div>
<div class="row">
    <div class="col-md-3">
        <p>Need a sponsor? Send email to your family member to help pay for using this application. Enter their email address below and press the &quot;send link on Email&quot; button. They will receive a link in your registered name to pay for you.</p>
        <?php $form = ActiveForm::begin([
            'id' => 'contact-form',
            'action' => 'subscription/send-link'
        ]); ?>
        <?= $form->field($link, 'userLink')->textInput(['readonly' => true,'class' => 'form-control'])->label(false); ?>
        <?= $form->field($link, 'email')->textInput(['placeholder' => 'Type email ...', 'class' => 'form-control'])->label(false); ?>
        <?= Html::submitButton('Send link on Email', ['class' => 'btn btn-primary']) ?>
        <?php $form->end(); ?>
    </div>
    <div class="col-md-2 text-center">
        <h1>-OR-</h1>
    </div>
    <div class="col-md-2">
        <p>You can pay from your PayPal account</p>
        <form action="<?= Url::toRoute('/subscription/checkout') ?>" method="get">
            <div class="form-group">
                <button class="btn btn-primary"><i class="fa fa-paypal"></i> Checkout with PayPal</button>
            </div>
        </form>
    </div>
    <div class="col-md-2 text-center">
        <h1>-OR-</h1>
    </div>
    <div class="col-md-3">
        <p>You can pay with Mobile Money</p>
        <button class="btn btn-primary" data-toggle="modal" data-target="#mobileMoneyInstruction"><i class="fa fa-mobile"></i> Instructions for MobileMoney</button>

        <div class="modal fade" id="mobileMoneyInstruction" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">Mobile money instructions</h4>
                    </div>
                    <div class="modal-body">
                        Monthly Mobile Money payment is available in specific countries using this method of payment. Access to past questions will be activated once payment has been received using the applicable phone numbers for specific countries.
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

