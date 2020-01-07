<?php

/* @var $this \yii\web\View */
/* @var $content string */

use frontend\assets\AngularAnimateAsset;
use frontend\assets\AngularBootstrapAsset;
use frontend\assets\AngularFileUploadAsset;
use frontend\assets\AngularLightboxAsset;
use frontend\assets\AngularMessages;
use frontend\assets\AngularNotyAsset;
use frontend\assets\AngularTimerAsset;
use frontend\assets\AngularTinymceAsset;
use frontend\assets\AngularUIRouterTabsAsset;
use frontend\assets\AppSiteAsset;
use frontend\assets\HumanizeAsset;
use frontend\assets\JQueryUIAsset;
use frontend\assets\MathJaxAsset;
use frontend\assets\NgDialogAsset;
use frontend\assets\TinymceAsset;
use frontend\assets\UIRouterAsset;
use yii\helpers\Html;
use yii\bootstrap\Nav;
use yii\bootstrap\NavBar;
use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Breadcrumbs;
use frontend\assets\AppAsset;
use frontend\assets\AngularAsset;
use frontend\assets\XeditableAsset;
use frontend\assets\DateTimeAsset;
use frontend\assets\MomentJsAsset;
use frontend\assets\AngularBreadcrumbsAsset;
use frontend\assets\AngularBusyAsset;
use common\widgets\Alert;

TinymceAsset::register($this);
MomentJsAsset::register($this);
HumanizeAsset::register($this);
MathJaxAsset::register($this);
AngularAsset::register($this);
AngularTimerAsset::register($this);
XeditableAsset::register($this);
DateTimeAsset::register($this);
AngularTinymceAsset::register($this);
UIRouterAsset::register($this);
NgDialogAsset::register($this);
AngularBreadcrumbsAsset::register($this);
AngularBusyAsset::register($this);
AngularUIRouterTabsAsset::register($this);
AngularBootstrapAsset::register($this);
AngularFileUploadAsset::register($this);
AngularAnimateAsset::register($this);
AngularNotyAsset::register($this);
AngularMessages::register($this);
JQueryUIAsset::register($this);
AngularLightboxAsset::register($this);
AppSiteAsset::register($this);

?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>" ng-app="TLA_SITE">
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
