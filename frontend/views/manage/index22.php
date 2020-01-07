<ul class="nav nav-tabs">
    <li role="presentation" class="active"><a href="#"> <?= $title ?> </a></li>
</ul>

<div ng-controller="ExamTypeCtrl">

    <form novalidate class="form-inline clearfix examtype-form" name="examtypeForm">
        <div class="form-group create-type-btn col-md-2">
            <button ng-click="createExamType()" class="btn btn-primary" role="button">Create <?= lcfirst($title) ?> </button>
        </div>
        <div class="form-group col-md-3">
            <input ng-model="newExamTypeName" type="text" class="form-control" placeholder="Enter new <?= lcfirst($title) ?>" required>
        </div>
    </form>

    <ul class="list-group examtype-list">
        <li ng-repeat="examtypeitem in examtypelist" class="list-group-item">
            <button ng-click="deleteExamtype(examtypeitem.id)" class="btn btn-xs btn-danger pull-right"><span class="glyphicon glyphicon-remove"></span></button>
            <button ng-click="$event.preventDefault(); textBtnForm.$show()" ng-hide="textBtnForm.$visible" class="btn btn-xs btn-primary pull-right examtype-edit-btn"><span class="glyphicon glyphicon-edit"></span></button>

            <span editable-text="examtypeitem.name" e-form="textBtnForm" onaftersave="updateExamtype(examtypeitem.id)" onbeforesave="checkName($data)">
                <a href="#/manage/exam/{{examtypeitem.id}}"> <span ng-bind="examtypeitem.name"></span> </a>
            </span>
        </li>
    </ul>
</div>
