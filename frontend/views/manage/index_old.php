<?php
/* @var $this yii\web\View */


?>



<ul class="nav nav-tabs">
    <li role="presentation" class="active"><a href="#"> <?= $title ?> </a></li>
</ul>

<div ng-controller="ExamtypeController as EC">

    <form novalidate class="form-inline clearfix examtype-form" name="examtypeForm">
        <div class="form-group create-type-btn col-md-2">
            <a ng-click="EC.createExamtype($event)" class="btn btn-primary" href="#" role="button">Create <?= lcfirst($title) ?> </a>
        </div>

        <div class="form-group col-md-3">
            <input ng-model="EC.newExamtype.name" type="text" class="form-control" placeholder="Enter new <?= lcfirst($title) ?>" required>
        </div>
    </form>

    <ul class="list-group examtype-list">
        <li ng-repeat="examType in EC.examTypes track by examType.id" class="list-group-item">
            <a ng-click="EC.deleteExamtype(examType.id, $event)" href="#" class="btn btn-xs btn-danger pull-right"><span class="glyphicon glyphicon-remove"></span></a>
            <a ng-click="$event.preventDefault(); textBtnForm.$show()" ng-hide="textBtnForm.$visible" href="#" class="btn btn-xs btn-primary pull-right examtype-edit-btn"><span class="glyphicon glyphicon-edit"></span></a>

            <span editable-text="examType.name" e-form="textBtnForm" onaftersave="EC.updateExamtype(examType.id)" onbeforesave="EC.checkName($data)">
                <a href="/manage/exam/{{examType.id}}"> <span ng-bind="examType.name"></span> </a>
            </span>
        </li>
    </ul>

</div>
