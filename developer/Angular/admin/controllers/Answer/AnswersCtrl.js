/**
 * Created by supostat on 02.11.15.
 */
app.controller('AnswersController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'AnswersModel',
    function ($http, $scope, $stateParams, $state, QuestionsService, AnswersModel) {
        var question_id = $stateParams.question_id;

        function getAnswers(){
            if(!question_id) {
                var empty = [];
                QuestionsService.answers.init(empty);
                $scope.answers = empty;
            } else {
                AnswersModel.all(question_id).then(function (result) {
                    QuestionsService.answers.init(result.data);
                    $scope.answers = result.data;
                });
            }
        }

        function addAnswer() {
            $scope.newAnswer.correct = 0;
            $scope.newAnswer.question_id = question_id;
            QuestionsService.answers.add($scope.newAnswer);
            $scope.newAnswer = {};
        }

        function setRightAnswer(index, e){
            if($(e.target).is('td')) {
                for (var i in $scope.answers) {
                    $scope.answers[i].correct = 0;
                }
                $scope.answers[index].correct = 1;
                QuestionsService.answers.init($scope.answers);
            }
        };

        function deleteAnswer(id, e) {
            for (var key in $scope.answers) {
                if (key == id) {
                    $scope.answers.splice(key, 1);
                    break;
                }
            }
            QuestionsService.answers.init($scope.answers);
        };


        //var updateAnswer = function (answer) {
        //    AnswersModel.update(answer.id, answer).then(function (result) {
        //    });
        //};


        function checkName(index) {
            if ($scope.answers[index].content.trim() == '') {
                return "Field cannot be blank";
            }
        };

        $scope.newAnswer = {};
        $scope.answers = [];
        $scope.addAnswer = addAnswer;
        $scope.setRightAnswer = setRightAnswer;
        $scope.deleteAnswer = deleteAnswer;
        $scope.checkName = checkName;

        getAnswers();
    }
]);