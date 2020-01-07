/**
 * Created by supostat on 16.11.15.
 */

app.filter('questionCount', function () {
    return function (items) {
        items = items + 1;
        return items;
    }
});

app.controller('PracticeExamController', ['$scope', 'PracticeExamsModel', 'ngDialog', '$sce',
    function ($scope, PracticeExamsModel, ngDialog, $sce) {
        $scope.practice = {};
        $scope.timer = false;
        var showQuestions = function (id) {
            PracticeExamsModel.fetch(id).then(function (result) {
                $scope.practice = result.data;
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                MathJax.Hub.Queue(function () {
                    $('#practice').css('opacity', 1);
                });
                $scope.timer = true;
                //$scope.selectedAnswers = $scope.quizpractice.answers;
                //$scope.time_start = $scope.quizpractice.start_practice;
            });
        };

        $scope.essayChange = function (question) {
            var essay = {
                id: question.id,
                essayText: question.essayText,
                quizpractice_id: $scope.practice.id
            };

            PracticeExamsModel.essayChange(essay).then(function (result) {
                question.answered = true;
            })
        };

        $scope.selectAnswer = function (question, answer) {
            question.answered = true;
            var answer = {
                question_id: question.id,
                answer_id: answer.id,
                quizpractice_id: $scope.practice.id
            };

            PracticeExamsModel.selectAnswer(answer).then(function (result) {
                $scope.selectedAnswers = result.data;
            });
        };


        $scope.stopPractice = function (timer) {
            if (timer) {
                $('#practice').submit();
                return;
            }
            $scope.cnt = 0;
            $scope.qis = 0;

            angular.forEach($scope.practice.questions, function (item) {
                $scope.cnt += item.answered ? 1 : 0;
            });

            angular.forEach($scope.practice.sections, function (section) {
                angular.forEach(section.questions, function (question) {
                    $scope.cnt += question.answered ? 1 : 0;
                    $scope.qis++;
                });
            });
            if ($scope.cnt == ($scope.practice.questions ? $scope.practice.questions.length + $scope.qis : $scope.qis)) {
                $('#practice').submit();
            } else {
                ngDialog.openConfirm({
                    template: 'stopPractice',
                    scope: $scope
                }).then(function () {
                    $('#practice').submit();
                });
            }
        };

        $scope.trustAsHtml = function (string) {
            return $sce.trustAsHtml(string);
        };

        $scope.getCount = function () {
            $scope.questionCount = $scope.questionCount + 1;
            return $scope.questionCount;
        };
        $scope.questionItem = 0;

        $scope.showQuestions = showQuestions;


    }]);