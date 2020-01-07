<?php
/* @var $this yii\web\View */

use yii\widgets\Breadcrumbs;

$this->title = 'Subject';
$this->params['subject-breadcrumbs'][] = ['label' => $subject->examtype->name, 'url'=>['#/manage/exam/'.$subject->examtype->id]];
$this->params['subject-breadcrumbs'][] = $subject->subjectOrigin->name;

?>


<ul class="nav nav-tabs">
    <li role="presentation" class="active"><a href="#"> Subjects </a></li>
</ul>

<?= Breadcrumbs::widget([
    'homeLink' => [
        'label' => $breadCrumbLabel,
        'url' => ['#/manage/exam'],
    ],
    'links' => isset($this->params['subject-breadcrumbs']) ? $this->params['subject-breadcrumbs'] : [],
    'options' => [
        'class' => 'breadcrumb subject-breadcrumbs',
    ],
]) ?>

<div>
    <ul class="nav nav-tabs" id="subjectElementsTab">
        <li class="active"><a id="video" href="#/manage/exam/<?= $subject->examtype->id ?>/subject/<?= $subject->id ?>/video" >Video</a></li>
        <li><a href="#/manage/exam/<?= $subject->examtype->id ?>/subject/<?= $subject->id ?>/notes" >Notes</a></li>
        <li><a id="quiz" href="#/manage/exam/<?= $subject->examtype->id ?>/subject/<?= $subject->id ?>/quiz" >Quiz</a></li>
        <li ><a href="#/manage/exam/<?= $subject->examtype->id ?>/subject/<?= $subject->id ?>/assignments" >Assignments</a></li>
    </ul>
    <div ui-view class="tab-content">

    </div>
</div>
