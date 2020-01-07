<div ui-view ng-controller="quizCtrl" ng-init="init()">
    <div class="form-group create-quiz-btn">
        <a ui-sref=".methods({'method' : 'create'})" " id="new-quize" class="btn btn-primary" role="button"> Add new quiz</a>
    </div>
    <ul class="list-group quiz-list">
        <li ng-repeat="quize in quizes track by quize.id" class="list-group-item">
            <button ng-click="deleteQuizConfirmDialog(quize)" class="btn btn-xs btn-danger pull-right"><span
                    class="glyphicon glyphicon-remove"></span></button>
            <a href="#" class="btn btn-xs btn-primary pull-right subject-manage-btn"><span
                    class="glyphicon glyphicon-pencil"></span></a>
            <a href="#" class="btn btn-xs btn-default pull-right subject-manage-btn"><span>Access rights</span></a>
            <a ui-sref="subject.elements.question({slug: 'quiz', quiz_id: quize.id})" class="btn btn-xs btn-default pull-right subject-manage-btn"><span>Questions</span>
            </a>
            <span>{{quize.name}}</span>
        </li>
    </ul>
    <script type="text/ng-template" id="templateId">
        <div class="ngdialog-message">
            <h1>Quiz removal</h1>
            <p>You really want to delete "{{ deleteQuiz.name }}" subject ?</p>
        </div>
        <div class="ngdialog-buttons mt">
            <button class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog()">No</button>
            <button class="ngdialog-button ngdialog-button-primary" ng-click="confirm(deleteQuiz.id)">Yes</button>
        </div>
    </script>
</div>