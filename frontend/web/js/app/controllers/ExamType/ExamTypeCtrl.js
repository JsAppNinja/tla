/**
 * Created by supostat on 01.11.15.
 */

app.controller('ExamTypeController', ['$http', '$scope', 'ExamsModel', '$rootScope', function ($http, $scope, ExamsModel, $rootScope) {

    function getExams() {
        ExamsModel.all().then(function (result) {
            $scope.exams = result.data;
        });
    }

    function createExam(exam) {
        ExamsModel.create(exam)
            .then(function (result) {
                $scope.newExam = {};
                getExams();
            });
    }

    function updateExam(exam) {
        ExamsModel.update(exam.id, exam)
            .then(function (result) {
                getExams();
            });
    }

    function deleteExam(examId) {
        ExamsModel.destroy(examId)
            .then(function (result) {
                getExams();
            });
    }

    $scope.exams = [];
    $scope.newExam = {};

    $scope.deleteExam = deleteExam;
    $scope.createExam = createExam;
    $scope.updateExam = updateExam;

    $scope.title = 'Grade level';

    getExams();
}]);