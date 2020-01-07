/**
 * Created by supostat on 01.11.15.
 */

app.controller('ExamTypeController', ['$http', '$scope', 'ExamsModel', '$rootScope', 'ngDialog', 'User', 'ENDPOINT_URI', '$state',
    function ($http, $scope, ExamsModel, $rootScope, ngDialog, User, ENDPOINT_URI, $state) {


        function getExams() {
            User.isAdmin().then(function (result) {
                $scope.isAdmin = result.data;
            });

            ExamsModel.all().then(function (result) {
                $scope.exams = result.data.data;
                $scope.title = 'Grade level';
            });
        }

        function checkFree(exam) {
            exam.free = !exam.free;
            ExamsModel.checkFree(exam.id).then(function (result) {
            })
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

        function deleteExam(exam) {
            $scope.deletedExamtype = exam;

            ngDialog.openConfirm({
                template: 'templateExamtype',
                scope: $scope,
                showClose: false
            }).then(function (examtype_id) {
                ExamsModel.destroy(examtype_id)
                    .then(function (result) {
                        getExams();
                    });
            });

        }
        

        $scope.changeState = function (grade) {
            ExamsModel.changeState(grade).then(function (response) {
                console.log(response);
            });
        };

        $scope.exams = [];
        $scope.newExam = {};
        $scope.isAdmin = false;

        $scope.deletedExamtype = {};
        $scope.deleteExam = deleteExam;
        $scope.createExam = createExam;
        $scope.updateExam = updateExam;
        $scope.checkFree = checkFree;

        $scope.title = null;

        getExams();
    }]);