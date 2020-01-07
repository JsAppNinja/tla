/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuizzesController', ['$http', '$scope', '$state', '$stateParams', 'QuizzesModel', 'ngDialog', '$timeout', 'notify', 'SubjectsModel', '$rootScope', 'ENDPOINT_URI',
    function ($http, $scope, $state, $stateParams, QuizzesModel, ngDialog, $timeout, notify, SubjectsModel, $rootScope, ENDPOINT_URI) {
        var subject_id = $stateParams.subject_id;

        SubjectsModel.fetch(subject_id).then(function (result) {
            $rootScope.subjectName = result.data.name;
        });

        function getQuizzes() {
            var data = {
                lesson_id: $stateParams.lesson_id,
                subject_id: $stateParams.subject_id
            };
            $http.get(ENDPOINT_URI + 'quizes/getTutorsQuizzes', {params: data}).then(function (response) {
                $scope.quizzes = response.data;

            });
        }

        $scope.log = '';

        function deleteQuiz(quiz) {
            $scope.deletedQuiz = quiz;
            ngDialog.openConfirm({
                template: 'templateId',
                scope: $scope,
                showClose: false
            }).then(function (quiz_id) {
                QuizzesModel.destroy(quiz_id).then(function (result) {
                    getQuizzes();
                })
            });
        }

        function openQuiz(quiz_id) {
            $state.go('.question', {quiz_id: quiz_id});
        }

        $scope.subject_id = subject_id;
        $scope.quizzes = [];

        $scope.sortConfig = {
            animation: 150,
            handle: ".sorting-handle",
            onSort: function (/** ngSortEvent */evt){
                $scope.sorted = true;
                $scope.sortedModel = evt.models;
                console.log(evt);
            }
        };

        $scope.saveOrder = function () {
            var data = [];

            angular.forEach($scope.sortedModel, function (value, key) {
                data.push({id: value.id, order: key});
            });
            QuizzesModel.saveOrder(data).then(function (result) {
                if(result) {
                    $scope.sorted = false;
                }
            })
        };

        $scope.sorted = false;
        $scope.sortedModel = [];

        $scope.deleteQuiz = deleteQuiz;
        $scope.openQuiz = openQuiz;

        getQuizzes();
    }]);