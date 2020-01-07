app.controller('FinishedQuizzesController', ['$scope', 'PracticeExamsModel',
    function ($scope, PracticeExamsModel) {

        function getFinishedQuizzes() {
            PracticeExamsModel.getFinishedQuizzes().then(function (result) {
                console.log(result.data);
                $scope.quizzes = result.data;
            })
        }

        $scope.getResultClass = function (quiz) {
            return parseInt(quiz.percentage) < 80 ? 'red' : 'green';
        };

        $scope.quizzes = [];

        getFinishedQuizzes();
    }]);