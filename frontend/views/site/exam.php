<?php

/* @var $this yii\web\View */
use yii\bootstrap\ActiveForm;
use yii\helpers\Html;


$this->title = 'Uploading exam';
$this->params['breadcrumbs'][] = $this->title;
?>

<?php
    $examErrors = Yii::$app->session->getFlash('exam_upload_errors', true);
    if (is_array($examErrors)) {
        foreach ($examErrors as $error) {
            echo "<div class=\"alert custom-alert alert-danger\" role=\"alert\">$error</div>";
        }

    }
?>

<div class="site-uploading">
    <?php if (Yii::$app->user->identity->user_type == 2) { ?>
        <?php $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'class' => 'exam-upload-form']]) ?>

        <?= $form->field($uploadExam, 'examFile')->fileInput(['accept' => '*']) ?>

        <div class="form-group">
            <?= Html::submitButton('Upload', ['class' => 'btn btn-primary upload-submit-btn']) ?>
        </div>

        <?php ActiveForm::end() ?>
    <?php } ?>
</div>
