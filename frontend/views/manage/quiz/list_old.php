    <div class="form-group create-quiz-btn">
        <button ng-click="newQuiz()" id="new-quize" class="btn btn-primary" role="button"> Add new quiz</button>
    </div>
    <ul class="list-group quiz-list">
        <li ng-repeat="quize in Quiz.quizes track by quize.id" class="list-group-item">
            <a ng-click="deleteQuiz(quize.id, $event)" href="#" class="btn btn-xs btn-danger pull-right"><span
                    class="glyphicon glyphicon-remove"></span></a>
            <a href="#" class="btn btn-xs btn-primary pull-right subject-manage-btn"><span
                    class="glyphicon glyphicon-pencil"></span></a>
            <a href="#" class="btn btn-xs btn-default pull-right subject-manage-btn"><span>Access rights</span></a>
            <button ng-controller="QuestionCtrl as Question" ng-init="Question.quiz_id = quize.id;Question.subject_id = Quiz.subject_id" ng-click="getQuestionsListDialog()" class="btn btn-xs btn-default pull-right subject-manage-btn"><span>Questions</span>
            </button>
            <span>{{quize.name}}</span>
        </li>
    </ul>
