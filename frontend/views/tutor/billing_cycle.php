<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 11.03.16
 * Time: 11:39
 */
use common\models\Billing;
use yii\grid\GridView;
use yii\helpers\Url;


$dStart = new DateTime();
$dEnd  = date_create($subscription->next_billing_date);
$dDiff = $dEnd->diff($dStart);
$diff = $dDiff->format('%h');
?>

<div class="page-header">
    <h2>Billing cycle</h2>
</div>
<div class="row">
    <div class="col-md-12">
        <h3>Subscription plan: <?= $subscription->plan->name ?></h3>
    </div>
</div>

<div class="row">
    <div class="col-md-12">
        <h3>Hours left for next payment: <?= $diff ?></h3>
    </div>
</div>
<div class="row">
    <div class="col-md-12">
        <div class="form-group">
            <a href="<?= Url::toRoute('change-plan') ?>" class="btn btn-primary" data-toggle="tooltip" data-placement="top" title="Coming soon"><i class="fa fa-retweet"></i> Change subscription plan</a>
        </div>
    </div>
</div>
<?php
echo GridView::widget([
    'dataProvider' => $provider,
    'rowOptions'=>function($model){
        switch($model->status) {
            case Billing::ERROR:
                return ['class' => 'danger'];
                break;
            case Billing::SUCCESS:
                return ['class' => 'success'];
                break;
        }
    },
    'columns' => [
        'id',
        'date',
        'description'
    ]
]);
?>

<script>
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
</script>
