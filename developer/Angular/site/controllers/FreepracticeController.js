/**
 * Created by supostat on 16.11.15.
 */

app.controller('FreepracticeController', ['$scope', 'PracticeExamsModel', 'Lightbox', 'ngDialog',
    function ($scope, PracticeExamsModel, Lightbox, ngDialog) {
        $scope.practice = {};

        var showQuestions = function (id) {
            PracticeExamsModel.getQuestions(id).then(function (result) {
                $scope.practice = result.data;
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                MathJax.Hub.Queue(function () {
                    $('#practice').css('opacity', 1);
                    $('#loader').hide();
                });
                $scope.timer = true;
            });
        };

        $scope.essayChange = function (question) {
            var essay = {
                id: question.id,
                essayText: question.essayText,
                quizpractice_id: $scope.practice.id
            };

            PracticeExamsModel.essayChange(essay).then(function (result) {
            })
        };

        $scope.selectAnswer = function (question_id, answer_id) {
            var answer = {
                question_id: question_id,
                answer_id: answer_id,
                quizpractice_id: $scope.practice.id
            };

            PracticeExamsModel.selectAnswer(answer).then(function (result) {
                $scope.selectedAnswers = result.data;
            });
        };

        $scope.stopPractice = function ($event) {
            $scope.cnt = 0;
            $scope.qis = 0;

            angular.forEach($scope.practice.questions, function (item) {
                $scope.cnt += item.answered ? 1 : 0;
            });

            angular.forEach($scope.practice.sections, function (section) {
                angular.forEach(section.questions, function (question) {
                    $scope.cnt += question.answered ? 1 : 0;
                    $scope.qis ++;
                });
            });
            if($scope.cnt == ($scope.practice.questions?$scope.practice.questions.length + $scope.qis:$scope.qis)) {
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

        $scope.getCount = function () {
            $scope.questionCount = $scope.questionCount + 1;
            return $scope.questionCount;
        };
        $scope.questionItem = 0;

        $scope.openLightboxModal = function (images, index) {
            Lightbox.openModal(images, index);
        };

        $scope.showQuestions = showQuestions;
    }]);