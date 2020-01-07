<?php

/* @var $this \yii\web\View */
/* @var $content string */

use common\widgets\Alert;
use frontend\assets\AngularAsset;
use frontend\assets\AngularBootstrapAsset;
use frontend\assets\AngularLightboxAsset;
use frontend\assets\AngularTimerAsset;
use frontend\assets\AppSiteAsset;
use frontend\assets\DateTimeAsset;
use frontend\assets\MathJaxAsset;
use frontend\assets\NgDialogAsset;
use kartik\form\ActiveForm;
use purrweb\AutoloadExample;
use yii\helpers\Html;
use yii\helpers\Url;

AngularAsset::register($this);
DateTimeAsset::register($this);
NgDialogAsset::register($this);
AngularBootstrapAsset::register($this);
AngularTimerAsset::register($this);
AngularLightboxAsset::register($this);
MathJaxAsset::register($this);
AppSiteAsset::register($this);

$login = $this->params['login'];

?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>" ng-app="TLA_SITE">
<head>
    <meta charset="<?= Yii::$app->charset ?>">
    <?= Html::csrfMetaTags() ?>
    <title><?= isset($this->params['title']) ? Html::encode($this->params['title']) . ' || PassGeek.com' : 'PassGeek.com' ?></title>
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
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="manifest" href="/favicon/manifest.json">
    <meta name="msapplication-TileImage" content="/favicon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
    <!--    <link href="/temporary/css/application.css" rel="stylesheet">-->
    <script type="text/javascript" src="/js/libs/flowplayer/flowplayer.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/js/libs/flowplayer/skin/minimalist.css">
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.0/jquery.scrollTo.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <script src="/temporary/js/counter.min.js"></script>
    <script src="/js/libs/mask.js"></script>
    <style type="text/css" media="print">
        * {
            display: none;
        }
    </style>
</head>
<body style="opacity: 0;" oncontextmenu="return false;" oncopy="return false;" data-spy="scroll"
      data-target=".fixed-top-menu" data-offset="250">
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
                        <div class="slide_up_login">
                            <?php
                            $form = ActiveForm::begin([
                                'id' => 'login-form',
                                'type' => ActiveForm::TYPE_INLINE,
                                'formConfig' => [
                                    'showErrors' => true
                                ],
                                'action' => 'site/login',
                                'enableAjaxValidation' => true,
                                'validateOnChange' => false,
                                'validateOnBlur' => false,
                            ]) ?>
                            <div class="row">
                                <div class="col-lg-3 col-md-3 col-sm-6 col-xs-6">
                                    <div class="checkbox">
                                        <label>
                                            <?= $form->field($login, 'rememberMe')->checkbox(); ?>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-lg-3 col-md-3 col-sm-6 col-xs-6">
                                    <div class="form-group">
                                        <?= Html::a('Forgot your password?', ['site/request-password-reset'], ['class' => 'forgot-link', 'style' => 'margin-bottom: 10px']) ?>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                                    <?= $form->field($login, 'email')->textInput(['layout' => 'inline', 'placeholder' => 'E-mail', 'class' => 'form-control e-mail', 'style' => 'margin-right:10px'])->label(false); ?>
                                </div>
                                <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                                    <?= $form->field($login, 'password')->passwordInput(['layout' => 'inline', 'placeholder' => 'Password', 'class' => 'form-control password'])->label(false); ?>
                                </div>
                                <div class="col-md-4 col-sm-6 col-xs-12">
                                    <div class="form-group">
                                        <div class="social">
                                            <span><?= Html::a('<i class="fa fa-twitter"></i> via Twitter', ['site/auth', 'authclient' => 'twitter']) ?></span>
                                            <span><?= Html::a('<i class="fa fa-facebook-square"></i> via Facebook', ['site/auth', 'authclient' => 'facebook']) ?></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-6 col-xs-12">
                                    <div class="form-group">
                                        <?= Html::submitButton('Login', ['class' => 'btn button_upslide']) ?>
                                    </div>
                                </div>
                            </div>

                            <?php ActiveForm::end() ?>
                            <button class="close_btn"><i class="fa fa-times"></i></button>
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
                <div class="main-menu__logo"><a href="<?= Url::base(true) ?>"></a><span
                        class="hidden-xs hidden-sm big hidden-xs-portlet">PassGeek</span><span
                        class="visible-xs-inline visible-sm-inline tiny hidden-xs-portlet">PassGeek</span></div>
            </div>
            <div class="collapse main-menu__menus navbar-collapse" id="bs-example-navbar-collapse-1">
                <div class="navbar-right">
                    <div>
                        <ul class="nav navbar-nav navbar-right main-menu__login-menu">
                            <li class="login li-item hidden-xs">
                                <div>
                                    <a href="javascript:;"><img src="/temporary/images/login_icon.png" alt="logo">Login</a>
                                </div>
                            </li>
                            <li class="login visible-xs-block"><a href="#">Login <span class="sr-only">(current)</span></a>
                            </li>
                            <li class="li-item hidden-xs">
                                <div>
                                    <a href="<?= Url::toRoute('site/signup'); ?>"><img
                                            src="/temporary/images/sign_up.png" alt="logo">Sign up</a>
                                </div>
                            </li>
                            <li class="visible-xs-block"><a href="<?= Url::toRoute('site/signup'); ?>">Sign Up</a></li>
                        </ul>
                    </div>
                    <div>
                        <ul class="nav navbar-nav navbar-right main-menu__navigation-menu">
                            <?php if (Url::current() == Url::toRoute('site/index')): ?>
                                <li class="active"><a class="linked" href="#sampleQA" data-offset="180">Try out sample QA and videos
                                        <span class="sr-only">(current)</span></a></li>
                                <li><a class="linked" href="#about" data-offset="100">About</a></li>
                                <li><a class="linked" href="#terms" data-offset="100">Terms</a></li>
                                <li><a class="linked" href="#disclosure" data-offset="100">Disclosure</a></li>
                                <li><a class="linked" href="#contacts" data-offset="80">Contact Us</a></li>
                            <?php else: ?>
                                <li><a href="<?= Url::toRoute('site/index') ?>#sampleQA" data-offset="180">Try out
                                        sample Q/A<span class="sr-only">(current)</span></a></li>
                                <li><a href="<?= Url::toRoute('site/index') ?>#about" data-offset="100">About</a></li>
                                <li><a href="<?= Url::toRoute('site/index') ?>#terms" data-offset="100">Terms</a></li>
                                <li><a href="<?= Url::toRoute('site/index') ?>#disclosure"
                                       data-offset="100">Disclosure</a></li>
                                <li><a href="<?= Url::toRoute('site/index') ?>#contacts" data-offset="80">Contact Us</a>
                                </li>
                            <?php endif; ?>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</div>
<?= $content ?>
<footer class="container-fluid">
    <div class="container">
        <div>
            <button class="btn button_to_top"><i class="arrow_top"></i><span>Scroll to top</span></button>
        </div>
        <span>© 2016 PassGeek.</span>
        <span>The creation and design of the site <a href="http://www.purrweb.com">Purrweb</a></span>
    </div>
</footer>
<script src="/temporary/js/main.js"></script>
<script>

    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-73759696-1', 'auto');
    ga('send', 'pageview');

    (function () {
        $(function () {

            $('#usersignupform-dateofbirth').mask('00-00-0000', {
                placeholder: "DD-MM-YYYY"
            });

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



            var loginFormVisible = false;
            if (window.location.hash && window.location.hash != '_=_') {
                $('.main-menu__navigation-menu li').removeClass('active');
                var hash = window.location.hash;
                var $el = $("[href=" + hash + "]");
                $el.parent().addClass('active');
                setTimeout(function () {
                    var a_offset = $el.data('offset');
                    var offset = loginFormVisible ? -(a_offset + 100) : -(a_offset);
                    $.scrollTo(hash, 500, {offset: {top: offset}});
                }, 1000);
            }


            $('#tabMd a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
        });
    })(jQuery);
</script>
<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
