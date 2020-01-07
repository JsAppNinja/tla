<h1>Message from <a href="http://passgeek.com">http://passgeek.com</a></h1>

<div><strong>First name: </strong><?= $model->firstName ?></div>
<?php if($model->middleName): ?>
<div><strong>Middle name: </strong><?= $model->middleName ?></div>
<?php endif; ?>
<div><strong>Last name: </strong><?= $model->lastName ?></div>
<?php if($model->country): ?>
    <div><strong>Country of residence: </strong><?= $model->country ?></div>
<?php endif; ?>
<div><strong>E-mail: </strong><?= $model->email ?></div>
<?php if($model->phone): ?>
    <div><strong>Phone: </strong><?= $model->phone ?></div>
<?php endif; ?>
<div><strong>Reason: </strong><?= $model->reasons[$model->reason] ?></div>
<?php if($model->text): ?>
    <div><strong>Comment: </strong><?= $model->text ?></div>
<?php endif; ?>



