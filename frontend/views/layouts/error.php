<?php

/* @var $this \yii\web\View */
/* @var $content string */

use frontend\assets\AppSiteAsset;
use yii\helpers\Html;
use yii\helpers\Url;

AppSiteAsset::register($this);

?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
<head>
    <meta charset="<?= Yii::$app->charset ?>">
    <?= Html::csrfMetaTags() ?>
    <title><?= Html::encode($this->title) ?></title>
    <?php $this->head() ?>
</head>
<body>
<?php $this->beginBody() ?>

<div class="container">
    <div class="site-index">
        <div class="row">
            <div class="col-xs-12">
                <div class="page-header">
                    <h1>Training Learning Application</h1>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12">
                <?= $content ?>
            </div>
        </div>
    </div>
    <?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
