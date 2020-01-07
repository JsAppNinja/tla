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
use frontend\assets\AppTutorUnsubscribeAsset;
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

AppTutorUnsubscribeAsset::register($this);

$current_url = Url::current();
?>
<?php $this->beginPage() ?>
    <!DOCTYPE html>
    <html lang="<?= Yii::$app->language ?>" ng-app="TUTOR_UNSUBSCRIBE">
    <head>
        <meta charset="<?= Yii::$app->charset ?>">
        <?= Html::csrfMetaTags() ?>
        <title><?= isset($this->params['title']) ? Html::encode($this->params['title']). ' || PassGeek.com' : 'PassGeek.com' ?></title>
        <?php $this->head() ?>

        <link rel="apple-touch-icon" sizes="57x57" href="/favicon/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="/favicon/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="/favicon/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="/favicon/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/favicon/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/favicon/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/favicon/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/favicon/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="/favicon/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
        <link rel="manifest" href="/favicon/manifest.json">
        <meta name="msapplication-TileImage" content="/favicon/ms-icon-144x144.png">
        <meta name="theme-color" content="#ffffff">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    </head>
    <body class="student" style="opacity:0;">
    <!--    <body class="student" style="opacity:0;" oncontextmenu="return false;" oncopy="return false;">-->
    <?php $this->beginBody() ?>

    <div class="container-fluid top-line"></div>
    <div class="container-fluid">
        <nav class="navbar main-menu navbar-fixed-top">
            <div class="container-fluid blue-bg">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="alert-block">
                                <?= Alert::widget(['options' => ['class' => 'custom-alert']]) ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse"
                            data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <div class="main-menu__logo"><a href="<?= Url::base(true) ?>"></a><span class="hidden-xs hidden-sm big hidden-xs-portlet">PassGeek</span><span class="visible-xs-inline visible-sm-inline tiny hidden-xs-portlet">PassGeek</span></div>
                </div>
                <div class="collapse main-menu__menus navbar-collapse" id="bs-example-navbar-collapse-1">
                    <div class="navbar-right">
                        <div>
                            <ul class="nav navbar-nav navbar-right main-menu__navigation-menu">
                                <li><a href="<?= Url::toRoute('site/logout') ?>">Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
    <section class="blue-half-bg"></section>
    <div class="container">
        <div class="main-container">
            <?= Breadcrumbs::widget([
                'links' => isset($this->params['breadcrumbs']) ? $this->params['breadcrumbs'] : [],
            ]) ?>
            <div class="row">
                <div class="col-xs-12">
                    <div class="alert-block">
                        <?= Alert::widget(['options' => ['class' => 'custom-alert']]) ?>
                    </div>
                    <?= $content ?>
                </div>
            </div>
        </div>
    </div>
    <footer>
        <div class="container">
            <div>
                <button class="btn button_to_top"><i class="arrow_top"></i><span>Scroll to top</span></button>
            </div>
            <span>© 2016 PassGeek.</span>
            <span>The creation and design of the site <a href="">Purrweb</a></span>
        </div>
    </footer>
    <script>
        $(document).ready(function () {
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('#totop').fadeIn();
                } else {
                    $('#totop').fadeOut();
                }
            });

            //Click event to scroll to top
            $('#totop').click(function () {
                $('html, body').animate({scrollTop: 0}, 800);
                return false;
            });
            (function ($) {
                $(function () {
                    var url = document.location.href;
                    var reg = /http/;
                    if (!url.match(reg)) {
                        $('body').html('<h1><a href="http://passgeek.com" style="display: block;position: relative;text-align: center;top: 300px;">http://passgeek.com</a></h1>');
                        $('body').animate({
                            opacity: 1
                        }, 600, function () {
                        });
                    } else {
                        $('body').animate({
                            opacity: 1
                        }, 200, function () {
                        });
                    }
                });
            })(jQuery);
        });
    </script>
    <script src="/temporary/js/main.js"></script>
    <?php $this->endBody() ?>
    </body>
    </html>
<?php $this->endPage() ?>