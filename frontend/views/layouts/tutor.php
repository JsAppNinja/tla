<?php

/* @var $this \yii\web\View */
/* @var $content string */

use frontend\assets\AngularAnimateAsset;
use frontend\assets\AngularBootstrapAsset;
use frontend\assets\AngularFileUploadAsset;
use frontend\assets\AngularLightboxAsset;
use frontend\assets\AngularMessages;
use frontend\assets\AngularNotyAsset;
use frontend\assets\AngularTinymceAsset;
use frontend\assets\AngularUIRouterTabsAsset;
use frontend\assets\AppTutorAsset;
use frontend\assets\JQueryUIAsset;
use frontend\assets\MathJaxAsset;
use frontend\assets\NgDialogAsset;
use frontend\assets\PermissionAngularAsset;
use frontend\assets\TinymceAsset;
use frontend\assets\UIRouterAsset;
use frontend\assets\WIRIXAsset;
use yii\helpers\Html;
use yii\helpers\Url;
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
WIRIXAsset::register($this);
MomentJsAsset::register($this);
MathJaxAsset::register($this);
AngularAsset::register($this);
XeditableAsset::register($this);
DateTimeAsset::register($this);
AngularTinymceAsset::register($this);
UIRouterAsset::register($this);
NgDialogAsset::register($this);
PermissionAngularAsset::register($this);
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

AppTutorAsset::register($this);

$current_url = Url::current();
?>
<?php $this->beginPage() ?>
<?php $this->beginPage() ?>
    <!DOCTYPE html>
    <html lang="<?= Yii::$app->language ?>" ng-app="TLA_TUTOR">
    <head>
        <meta charset="<?= Yii::$app->charset ?>">
        <?= Html::csrfMetaTags() ?>
        <title><?= Html::encode($this->title) ?></title>
        <script src="//cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js"></script>
        <?php $this->head() ?>
    </head>
    <body>
    <?php $this->beginBody() ?>
    <eeh-navigation-navbar nav-class="'navbar-default'" container-class="'container'" menu-name="'myMenu'" brand-text="'PassGeek'"></eeh-navigation-navbar>
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <div ui-view>

                </div>
            </div>
        </div>
    </div>
    <?php $this->endBody() ?>
    <div id="totop">
        <span><i class="fa fa-arrow-circle-up"></i> Scroll to top</span>
    </div>
    <script>
        $(document).ready(function(){
            $(window).scroll(function(){
                if ($(this).scrollTop() > 100) {
                    $('#totop').fadeIn();
                } else {
                    $('#totop').fadeOut();
                }
            });

            //Click event to scroll to top
            $('#totop').click(function(){
                $('html, body').animate({scrollTop : 0},800);
                return false;
            });

        });
    </script>
    </body>
    </html>
<?php $this->endPage() ?>