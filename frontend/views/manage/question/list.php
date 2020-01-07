<div ui-view>
    <div class="col-md-8" ng-controller="QuestionCtrl" ng-init="getQuestionsList()">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Questions</h3>
            </div>
            <div class="panel-body">
                <ul class="list-group questions-list">
                    <li ng-repeat="question in questions" class="list-group-item">
                        <button ng-click="deleteQuestion(question.id)" class="btn btn-xs btn-danger pull-right"><span
                                class="glyphicon glyphicon-remove"></span></button>
                        <a ui-sref="subject.elements.question.edit({question_id: question.id})" class="btn btn-xs btn-primary pull-right subject-manage-btn"><span
                                class="glyphicon glyphicon-pencil"></span></a>
                        <span>{{question.content}}</span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="form-group flex-content flex-justify-between">
            <a ui-sref="subject.elements.question.create()" class="btn btn-primary">New Question</a>
            <button class="btn btn-default">Import from xls</button>
            <a ui-sref="subject.elements()" id="back-quiz-list" class="btn btn-default pull-right">Back</a>
        </div>

    </div>
</div>