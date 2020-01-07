<?php
/* @var $this yii\web\View */

use yii\widgets\Breadcrumbs;

$this->title = 'Subjects';
$this->params['subject-breadcrumbs'][] = $examType->name;
?>


<ul class="nav nav-tabs">
    <li role="presentation" class="active"><a href="#"> Subjects </a></li>
</ul>


<div ng-controller="SubjectController as SC" data-examtype="<?= $examType->id ?>">
    <span ng-init="SC.examTypeId = <?= $examType->id ?>" name="examTypeElement" class="hidden"></span>

    <?= Breadcrumbs::widget([
        'homeLink' => [
            'label' => $breadCrumbLabel,
            'url' => \yii\helpers\Url::to(['manage/index']),
        ],
        'links' => isset($this->params['subject-breadcrumbs']) ? $this->params['subject-breadcrumbs'] : [],
        'options' => [
            'class' => 'breadcrumb subject-breadcrumbs',
        ],
    ]) ?>

    <ul class="list-group subject-list">
        <li ng-repeat="subject in SC.subjects track by subject.id" class="list-group-item">
            <a ng-click="SC.deleteSubject(subject.id, $event)" href="#" class="btn btn-xs btn-danger pull-right"><span class="glyphicon glyphicon-remove"></span></a>
            <a href="/manage/exam/{{SC.examTypeId}}/subject/{{subject.id}}" class="btn btn-xs btn-primary pull-right subject-manage-btn"><span>Add...</span></a>
            <span ng-bind="subject.name"></span>
        </li>

    </ul>

    <div class="form-group">
        <div class="dropdown">
            <button class="btn btn-default dropdown-toggle subject-btn" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                <span ng-bind="SC.selectedSubject.id == null ? 'Select a subject' : SC.selectedSubject.name">Select a subject</span>

                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                <li ng-repeat="subjectOrigin in SC.listOrigin track by subjectOrigin.id"><a ng-click="SC.selectSubject(subjectOrigin.id, subjectOrigin.name)" href="#"> {{ subjectOrigin.name }} </a></li>
            </ul>
        </div>
    </div>

    <div class="form-group create-subject-btn">
        <a ng-click="SC.createSubject($event)" class="btn btn-primary" href="#" role="button"> Add subject </a>
    </div>
</div>
