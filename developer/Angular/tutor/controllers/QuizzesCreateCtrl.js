/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuizzesCreateController', ['$http', '$scope', '$state', '$stateParams', '$filter', 'QuizzesModel', function ($http, $scope, $state, $stateParams, $filter, QuizzesModel) {

    var subject_id = $stateParams.subject_id;

    $scope.saveQuiz = function() {
        var quiz = $scope.quiz;
        quiz.subject_id = subject_id;
        quiz.date = moment(quiz.date).format("YYYY-MM-DD");
        quiz.hours = (quiz.hours.getHours() * 60) + quiz.hours.getMinutes();
        quiz.lesson_id = $stateParams.lesson_id;
        QuizzesModel.create(quiz).then(function (result) {
            $state.go('grade-index.level.subject.lessons.materials.quizzes', {}, {reload: true});
        })
    };

    $scope.submit = function () {
        if(!$scope.quizForm.$invalid) {
        }
    };

    $scope.onTimeSet = function (newDate, oldDate) {
        $scope.quiz.date = $filter('date')(newDate, "MMMM yyyy");
    };

    var date = new Date();
    date.setHours(1);
    date.setMinutes(0);
    $scope.quiz = {};
    $scope.quiz.hours = date;
    $scope.subject_id = subject_id;
    $scope.submitted = false;
}]);