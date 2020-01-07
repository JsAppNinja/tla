<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use common\models\User;
use yii\helpers\Url;

/* @var $this yii\web\View */

$this->title = 'Training/Learning application';
?>
<div class="row">
    <div class="col-xs-12">
        <div class="form-group">
            <a href="<?= Url::toRoute('freepractice/index') ?>" class="btn btn-primary btn-lg">Try out sample Q/A</a>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-xs-12">
        <div class="flowplayer is-splash"
             style="background-color:#777; background-image:url(/images/video-placeholder.png);">
            <video>
                <source type="video/mp4" src="video/main.mp4">
            </video>
        </div>
    </div>
</div>
