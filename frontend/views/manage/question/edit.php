<div ng-controller="QuestionCtrl" ng-init="getQuestionData()">
    <div class="row">
        <div class="col-md-12">
            <div class="page-header">
                <h1><?= $question->quiz->name ?></h1>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <textarea ng-model="question.content" class="form-control" rows="6"
                          >{{question.content}}</textarea>
            </div>
            <div ng-controller="AnswersCtrl" ng-init="init()">
                <div class="form-group">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h3 class="panel-title">Answers</h3>
                        </div>
                        <div class="panel-body">
                            <ul class="list-group answers-list">
                                <li ng-repeat="answer in answers track by $index" class="list-group-item answer-list-item" ng-click="setRightAnswer($index, $event)">
                                    <span ng-show="answer.correct" class="glyphicon glyphicon-ok pull-left right-answer"></span>
                                    <button ng-click="deleteAnswer($index, $event)" class="btn btn-xs btn-danger pull-right"><span class="glyphicon glyphicon-remove"></span></button>
                                    <button ng-click="$event.preventDefault(); textBtnForm.$show()" ng-hide="textBtnForm.$visible" class="btn btn-xs btn-primary pull-right examtype-edit-btn"><span class="glyphicon glyphicon-edit"></span></button>
                                    <span editable-text="answer.content" e-form="textBtnForm" onaftersave="updateAnswer($index)" onbeforesave="checkName($data)">
                                        <span>{{ answer.content }}</span>
                                     </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="form-inline form-group">
                    <div class="form-group answer-input">
                        <input type="text" ng-model="newAnswer.content" placeholder="Enter new answer" class="form-control">
                    </div>
                    <button class="btn btn-primary pull-right" ng-click="addAnswer()">Add new answer</button>
                </div>
            </div>
            <div class="form-inline form-group">
                <div class="form-group">
                    <button ng-click="updateQuestion()" class="btn btn-primary">Update</button>
                </div>
                <a ui-sref="subject.elements.question()" class="btn btn-default pull-right">Back to questions list</a>
            </div>
        </div>
        <div class="col-md-6">
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <select name="" id="" class="form-control" placeholder="Select topic">
                            <option>Select topic</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <select name="" id="" class="form-control">
                            <option>Select sub-topic</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">3</div>
            </div>
        </div>
    </div>
</div>
