
<?php
    $count = 0;
?>
<div class="page-header">
    <h2>Subscriptions</h2>
</div>
<table class="table table-striped">
    <tr>
        <th>#</th>
        <th>User First name</th>
        <th>User Last name</th>
        <th>Profile</th>
        <th>Status</th>
    </tr>
    <?php foreach($model as $subscription): ?>
    <?php $count ++; ?>
        <tr>
            <td><?= $count ?></td>
            <td><?= $subscription->user->first_name ?></td>
            <td><?= $subscription->user->last_name ?></td>
            <td><?= $subscription->profile ?></td>
            <td><?= $subscription->getStatus() ?></td>
        </tr>
    <?php endforeach; ?>
</table>