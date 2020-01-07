/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuestionsController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsModel',
    function ($http, $scope, $stateParams, $state, QuestionsModel) {

        var quiz_id = $stateParams.quiz_id;
        function getQuestions() {
            QuestionsModel.all(quiz_id).then(function (result) {
                if (result.data == false) {
                    $scope.isEmptyQuestions = true;
                } else {
                    $scope.isEmptyQuestions = false;
                }
                $scope.questions = result.data;
            });
        }

        function loadQuestionsFromXls() {
            console.log('asf');
        }

        function deleteQuestion(question_id) {
            QuestionsModel.destroy(question_id).then(function (result) {
                if ($scope.questions == false) {
                    $scope.isEmptyQuestions = true;
                } else {
                    $scope.isEmptyQuestions = false;
                }
                getQuestions();
            })
        }

        $scope.questions = [];
        $scope.isEmptyQuestions = false;
        $scope.deleteQuestion = deleteQuestion;
        $scope.loadQuestionsFromXls = loadQuestionsFromXls;

        getQuestions();
    }
]);