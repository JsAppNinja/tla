<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 09.03.16
 * Time: 12:08
 */
use yii\helpers\Url;

?>
<div class="page-header">
    <h2>Subscription plans</h2>
</div>
<div ng-controller="MobileMoneyController">
    <div class="row" ng-show="mm.state">
        <div class="col-md-12">
            <div style="font-size: 24px">
                <p><strong>Mobile Money payment phone number(s)</strong></p>
                <p><strong> {{selectedCountry.phones}}</strong></p>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <ul id="tabs" class="nav nav-pills col-md-3 col-md-offset-5" data-tabs="tabs" style="margin-bottom: 20px;">
                <li ng-click="toggleMM(false)" class="active"><a href="#red" data-toggle="tab"><i class="fa fa-paypal"></i> PayPal</a></li>
                <li ng-click="toggleMM(true)" ng-show="hasMM"><a href="#orange" data-toggle="tab"><i class="fa fa-mobile"></i> Mobile Money</a></li>
            </ul>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div id="my-tab-content" class="tab-content">
                <div class="tab-pane active" id="red">
                    <div class="row">
                        <?php foreach ($model as $plan): ?>
                            <div class="col-md-3">
                                <div class="panel panel-default text-center">
                                    <form action="<?= Url::toRoute('tutor-subscription/checkout') ?>" method="post">
                                        <input type="hidden" name="plan_id" value="<?= $plan->id ?>">
                                        <input type="hidden" name="_csrf"
                                               value="<?= Yii::$app->request->getCsrfToken() ?>"/>
                                        <h1><?= $plan->name ?></h1>
                                        <p><strong>Teach <?= $plan->students_count ?></strong></p>
                                        <p><strong>$<?= $plan->amount / $plan->students_count ?> per student</strong>
                                        </p>
                                        <p><?= $plan->description ?></p>
                                        <div class="form-group">
                                            <button type="submit" class="btn btn-primary">Subscribe for
                                                $<?= $plan->amount ?>/Month
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div class="tab-pane" id="orange" ng-show="hasMM">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-horizontal">
                                <div class="form-group">
                                    <label class="col-md-1 control-label">Country: </label>
                                    <div class="col-md-3">
                                        <select class="form-control"
                                                ng-options="option.name for option in countries track by option.id"
                                                ng-model="selectedCountry"
                                                ng-change="setPlans(selectedCountry)"></select>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-3" ng-repeat="subscriptionPlan in subscriptionPlans track by $index"
                             ng-if="subscriptionPlan.mm">
                            <div class="panel panel-default text-center" style="padding: 5px;">
                                <p style="margin-top: 10px;">{{subscriptionPlan.name}}</p>

                                <h1>Students: {{subscriptionPlan.students_count}}</h1>

                                <p><strong>{{ selectedCountry.currency }} {{subscriptionPlan.perStudentPrice}} per
                                        student</strong></p>

                                <p>{{ subscriptionPlan.description }}</p>

                                <p>Subscribe for:</p>

                                <div style="font-size: 30px">{{ selectedCountry.currency }}
                                    {{subscriptionPlan.mm}}/Month
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
