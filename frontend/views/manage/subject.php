<?php
/* @var $this yii\web\View */

use yii\widgets\Breadcrumbs;

$this->title = 'Subjects';
$this->params['subject-breadcrumbs'][] = $examType->name;
?>


<ul class="nav nav-tabs">
    <li role="presentation" class="active"><a href="#"> Subjects </a></li>
</ul>


<div ng-controller="SubjectCtrl" ng-init="init(<?= $examType->id ?>)">
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

    <ul class="list-group subject-list">
        <li ng-repeat="subject in subjects" class="list-group-item">
            <button ng-click="deleteSubject(subject.id)" class="btn btn-xs btn-danger pull-right"><span class="glyphicon glyphicon-remove"></span></button>
            <a href="#/manage/exam/{{examTypeId}}/subject/{{subject.id}}" class="btn btn-xs btn-primary pull-right subject-manage-btn"><span>Add...</span></a>
            <span ng-bind="subject.name"></span>
        </li>
    </ul>

    <div class="form-group">
        <div class="dropdown">
            <button class="btn btn-default dropdown-toggle subject-btn" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                <span ng-bind="selectedSubject.id == null ? 'Select a subject' : selectedSubject.name">Select a subject</span>

                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                <li ng-repeat="subjectOrigin in listOrigin"><a ng-click="selectSubject(subjectOrigin.id, subjectOrigin.name)" href="javascript:;"> {{ subjectOrigin.name }} </a></li>
            </ul>
        </div>
    </div>

    <div class="form-group create-subject-btn">
        <button ng-click="createSubject()" class="btn btn-primary" role="button"> Add subject </button>
    </div>

</div>
