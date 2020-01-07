<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 04.03.16
 * Time: 10:49
 */
use yii\helpers\Url;

?>

<section class="blue-half-bg"></section>
<section class="container-fluid">
    <div class="container main-container">
        <div class="row">
            <div class="col-md-12">
                <a href="<?= Url::toRoute('student/practice-exam') ?>">Back to quizzes list</a>

                <div class="page-header">
                    <h2>Pay for <?= $model->first_name ?> <?= $model->last_name ?></h2>
                </div>
                <div class="form-group">
                    <p>You can pay from your PayPal account</p>

                    <form action="<?= Url::toRoute('/subscription/checkout') ?>" method="post">
                        <input type="hidden" name="_csrf" value="<?= Yii::$app->request->getCsrfToken() ?>"/>
                        <input type="hidden" name="user_hash" value="<?= $model->hash ?>">

                        <div class="form-group">
                            <button class="btn btn-primary"><i class="fa fa-paypal"></i> Checkout with PayPal</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>