/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuizzesEditController', ['$http', '$scope', '$state', '$stateParams', 'QuizzesModel', '$filter', function ($http, $scope, $state, $stateParams, QuizzesModel, $filter) {

    var subject_id = $stateParams.subject_id;
    var quiz_id = $stateParams.quiz_id;

    function getQuiz() {
        QuizzesModel.fetch(quiz_id).then(function (result) {
            result.data.date = $filter('date')(result.data.date, "MMMM yyyy");
            $scope.quiz = result.data;
            var date = new Date();
            date.setHours($scope.quiz.hours / 60);
            date.setMinutes($scope.quiz.hours % 60);
            $scope.quiz.hours = date;
        });
    }

    function updateQuiz() {
        var quiz = {
            name: $scope.quiz.name,
            description: $scope.quiz.description,
            subject_id : subject_id,
            date : moment($scope.quiz.date).format("YYYY-MM-DD"),
            hours : ($scope.quiz.hours.getHours() * 60) + $scope.quiz.hours.getMinutes()
        };
        QuizzesModel.update(quiz_id, quiz).then(function (result) {
            $state.go('grade-index.level.subject.lessons.materials.quizzes', {}, {reload: true});
        })
    }

    $scope.submit = function () {
        if(!$scope.quizForm.$invalid) {
            updateQuiz();
        }
    };

    $scope.onTimeSet = function (newDate, oldDate) {
        $scope.quiz.date = $filter('date')(newDate, "MMMM yyyy");
    };

    $scope.subject_id = subject_id;
    $scope.quiz = {};

    $scope.updateQuiz = updateQuiz;

    getQuiz();
}]);