/**
 * Created by supostat on 01.11.15.
 */

app.controller('ExamTypeController', ['$http', '$scope', 'ExamsModel', '$rootScope', 'ngDialog', 'User',
    function ($http, $scope, ExamsModel, $rootScope, ngDialog, User) {

        function getExams() {
            User.isAdmin().then(function (result) {
                $scope.isAdmin = result.data;
            });

            ExamsModel.all().then(function (result) {
                $scope.exams = result.data.data;
                $scope.title = result.data.type == 2 ? 'Grade level' : 'Exam type';
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

        };

        $scope.saveOrder = function () {
            var data = [];

            angular.forEach($scope.sortedModel, function (value, key) {
                data.push({id: value.id, order: key});
            });
            ExamsModel.saveOrder(data).then(function (result) {
                if (result) {
                    $scope.sorted = false;
                }
            })
        };

        $scope.sortConfig = {
            animation: 150,
            handle: ".sorting-handle",
            onSort: function (/** ngSortEvent */evt) {
                $scope.sorted = true;
                $scope.sortedModel = evt.models;
            }
        };
        
        $scope.sorted = false;
        $scope.sortedModel = [];


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