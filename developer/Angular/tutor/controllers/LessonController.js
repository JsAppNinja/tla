/**
 * Created by supostat on 22.03.16.
 */

app.controller('LessonController', ['$scope', 'ENDPOINT_URI', '$http', '$stateParams', 'ngDialog', '$state', '$rootScope',
    function ($scope, ENDPOINT_URI, $http, $stateParams, ngDialog, $state, $rootScope) {

        console.log($rootScope.nnn);

        function getLessons() {
            $http.get(ENDPOINT_URI + 'lessons', {
                params: {
                    level_id: $stateParams.level_id,
                    subject_id: $stateParams.subject_id
                }
            }).then(
                function (response) {
                    $scope.lessons = response.data;
                },
                function (response) {
                    console.log(response);
                })
        }

        getLessons();

        function deleteLesson(lesson) {
            $scope.deletedLesson = lesson;
            ngDialog.openConfirm({
                template: 'templateId',
                scope: $scope,
                showClose: false
            }).then(function (lesson_id) {
                $http.delete(ENDPOINT_URI + 'lesson/delete', {params: {id: lesson_id}}).then(
                    function (response) {
                        console.log(response);
                        getLessons();
                    },
                    function (response) {
                        console.log(response);
                    }
                );
            });
        }

        $scope.sortConfig = {
            animation: 150,
            handle: ".sorting-handle",
            onSort: function (/** ngSortEvent */evt){
                $scope.sorted = true;
                $scope.sortedModel = evt.models;
                console.log(evt);
            }
        };

        $scope.openLesson = function (id) {
            $state.go('grade-index.level.subject.lessons.materials.video', {lesson_id: id});
        };

        $scope.saveOrder = function () {
            var data = [];

            angular.forEach($scope.sortedModel, function (value, key) {
                data.push({id: value.id, order: key});
            });
            $http.post(ENDPOINT_URI + 'lesson/save-order', data).then(
                function (response) {
                    if(response) {
                        $scope.sorted = false;
                    }
                },
                function (response) {

                }
            );
        };

        $scope.sorted = false;
        $scope.sortedModel = [];

        $scope.lessons = [];
        $scope.deleteLesson = deleteLesson;
    }]);