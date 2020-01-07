<?php

/* @var $this \yii\web\View */
/* @var $content string */

use common\models\User;
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
use frontend\assets\AppStudentAsset;
use frontend\assets\FontAwesomeAsset;
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
use kartik\form\ActiveForm;
use yii\widgets\Breadcrumbs;
use frontend\assets\AppAsset;
use frontend\assets\AngularAsset;
use frontend\assets\XeditableAsset;
use frontend\assets\DateTimeAsset;
use frontend\assets\MomentJsAsset;
use frontend\assets\AngularBreadcrumbsAsset;
use frontend\assets\AngularBusyAsset;
use common\widgets\Alert;
use yii\widgets\Menu;

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
FontAwesomeAsset::register($this);
User::isStudent() ? AppStudentAsset::register($this) : AppSiteAsset::register($this);

?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>" ng-app="<?= User::isStudent() ? 'TLA_STUDENT' : 'TLA_SITE' ?>">

<head>
    <meta charset="<?= Yii::$app->charset ?>">
<!--    <link href='https://fonts.googleapis.com/css?family=Ubuntu:400,700,300' rel='stylesheet' type='text/css'>-->
<!--    <link href='https://fonts.googleapis.com/css?family=Indie+Flower' rel='stylesheet' type='text/css'>-->
<!--    <link href='https://fonts.googleapis.com/css?family=Josefin+Sans:400,300,700' rel='stylesheet' type='text/css'>-->
<!--    <link href='https://fonts.googleapis.com/css?family=Raleway:400,700' rel='stylesheet' type='text/css'>-->
<!--    <link href='https://fonts.googleapis.com/css?family=Roboto:400,700,300' rel='stylesheet' type='text/css'>-->
    <?= Html::csrfMetaTags() ?>
    <title><?= isset($this->params['title']) ? Html::encode($this->params['title']) : 'TLA' ?></title>
    <?php $this->head() ?>

    <script type="text/javascript" src="/js/libs/flowplayer/flowplayer.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/js/libs/flowplayer/skin/minimalist.css">

</head>

<body>
<?php $this->beginBody() ?>

<div class="alert-block">
    <?= Alert::widget(['options' => ['class' => 'custom-alert']]) ?>
</div>

<div class="container">
    <div class="site-index">
        <div class="row">
            <div class="col-xs-12">
                <div class="page-header" style="vertical-align: middle;">
                    <img src="/images/logo.png" width="150" alt="">

                    <h1 style="display: inline-block;vertical-align: middle;margin-left: 30px;">Training Learning
                        Application</h1>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-9">
                <?php NavBar::begin([
                    'id' => false,
                    'options' => ['class' => ''],
                    'renderInnerContainer' => false
                ]);
                echo Nav::widget([
                    'items' => [
//                        ['label' => 'Exams', 'url' => ['site/exams']],
                        ['label' => 'Home', 'url' => ['site/index']],
                        ['label' => 'About', 'url' => ['site/about']],
                        ['label' => 'Terms', 'url' => ['site/terms']],
                        ['label' => 'Disclosure', 'url' => ['site/disclosure']],
                    ],
                    'options' => ['class' => 'nav navbar-nav'],
                ]);
                echo Nav::widget([
                    'items' => [
                        ['label' => 'Contact Us', 'url' => ['site/contact']],
                        ['label' => 'Testimonials', 'url' => ['site/testimonials']],
                    ],
                    'options' => ['class' => 'nav navbar-nav'],
                ]);
                NavBar::end(); ?>
                <?= Breadcrumbs::widget([
                    'links' => isset($this->params['breadcrumbs']) ? $this->params['breadcrumbs'] : [],
                ]) ?>
                <div ui-view>
                    <?= $content ?>
                </div>
            </div>

            <div class="col-xs-3">
                <?php if (Yii::$app->user->isGuest): ?>

                    <div class="row">
                        <div class="col-xs-12">
                            <div class="sign-in-block">
                                <div class="title">Sign In</div>
                                <div class="form-group clearfix">
                                    <?php $form = ActiveForm::begin([
                                        'options' => ['class' => ['pull-right', 'sign-in']],
                                    ]) ?>
                                    <?php
                                    echo $form->field($this->params['login'], 'email', [
                                        'addon' => ['prepend' => ['content' => '@']]
                                    ])->textInput(['placeholder' => 'Email'])->label(false);
                                    ?>
                                    <?php
                                    echo $form->field($this->params['login'], 'password', [
                                        'addon' => ['prepend' => ['content' => '<i class="glyphicon glyphicon-lock"></i>']]
                                    ])->passwordInput(['placeholder' => 'Password'])->label(false);
                                    ?>

                                    <div class="form-group forgot-block clearfix">
                                        <?= Html::a('Forgot your password?', ['site/request-password-reset'], ['class' => 'forgot-link pull-left']) ?>
                                        <?= Html::submitButton('<i class="fa fa-sign-in"></i> Login', ['class' => 'btn btn-primary sign-in-btn pull-right']) ?>
                                    </div>
                                    <?php ActiveForm::end() ?>

                                    <div class="form-group social-signin pull-right">
                                        <?= Html::a('<i class="fa fa-facebook-square"></i> via Facebook', ['site/auth', 'authclient' => 'facebook'], ['class' => 'btn btn-primary fb-btn']) ?>
                                        <?= Html::a('<i class="fa fa-twitter"></i> via Twitter', ['site/auth', 'authclient' => 'twitter'], ['class' => 'btn btn-primary tw-btn']) ?>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="sign-up-block">
                                <div class="title">Sign Up</div>
                                <div class="form-group clearfix">
                                    <?php $form = ActiveForm::begin([
                                        'options' => ['class' => ['sign-up']],
                                    ]) ?>

                                    <div class="sign-up-info">
                                        Sign Up as student, teacher, school, advertiser,
                                        parent <?= Html::a('Learn more ...', ['site/index']) ?>
                                    </div>

                                    <?php
                                    echo $form->field($this->params['email'], 'email', [
                                        'addon' => [
                                            'append' => [
                                                'content' => Html::submitButton('<i class="fa fa-user-plus"></i> Sign Up', ['class' => 'btn btn-primary']),
                                                'asButton' => true
                                            ]
                                        ]
                                    ])->textInput(['placeholder' => 'Email'])->label(false);
                                    ?>
                                    <?php ActiveForm::end() ?>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-xs-12">
                            <h4>Number of users</h4>
                            <div>Students - <span class="badge"> <?= $this->params['numberOfStudents'] ?> </span>
                            </div>
                            <div>Tutors - <span class="badge"> <?= $this->params['numberOfTeachers'] ?> </span>
                            </div>
                            <div>Schools - <span class="badge"> <?= $this->params['numberOfSchools'] ?> </span>
                            </div>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="row">
                        <div class="col-xs-12">
                            <div class="user-block well">
                                <div class="title">Hi, <?= Yii::$app->user->identity->getCaption() ?></div>
                                <?php NavBar::begin([
                                    'id' => false,
                                    'options' => ['class' => 'xxx'],
                                    'renderInnerContainer' => false
                                ]);
                                echo Nav::widget([
                                    'encodeLabels' => false,
                                    'items' => [
                                        ['label' => '<i class="fa fa-question-circle"></i> Exam practice', 'url' => ['student/practice-exam']],
                                        ['label' => '<i class="fa fa-list-alt"></i> Finished quizzes', 'url' => ['student/finished-quizzes']],
                                        ['label' => '<i class="fa fa-cogs"></i> Account settings', 'url' => ['student/account-settings']],
                                    ],
                                    'options' => ['class' => 'nav sidebar-nav'],
                                ]);
                                ?>
                                <?php NavBar::end() ?>
                                <?= Html::a('Logout', ['site/logout'], ['class' => 'btn btn-primary']) ?>
                            </div>

                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php $this->endBody() ?>
    <hr>
    <div class="footer">
        <h1>Footer</h1>
    </div>
    <div id="totop">
        <span><i class="fa fa-arrow-circle-up"></i> Scroll to top</span>
    </div>
    <script>
        $(document).ready(function () {
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('#totop').fadeIn();
                } else {
                    $('#totop').fadeOut();
                }
            });

            $('#totop').click(function () {
                $('html, body').animate({scrollTop: 0}, 800);
                return false;
            });

        });
    </script>
</body>
</html>
<?php $this->endPage() ?>
