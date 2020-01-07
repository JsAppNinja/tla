/**
 * Created by supostat on 22.03.16.
 */

app.controller('LessonEditController', ['$scope', 'ENDPOINT_URI', '$http', '$stateParams', '$state',
    function ($scope, ENDPOINT_URI, $http, $stateParams, $state) {

        $scope.updateLesson = function (lesson) {
            lesson.subject_id = $stateParams.subject_id;
            $http.put(ENDPOINT_URI + 'lesson/update', lesson).then(
                function (response) {
                    $state.go('grade-index.level.subject.lessons', {}, {reload: true});
                },
                function (response) {
                    console.log(response);
                }
            );
        };

        function getLesson() {
            $http.get(ENDPOINT_URI + 'lesson/view', {params: {id: $stateParams.lesson_id}}).then(
                function (response) {
                    $scope.lesson = response.data;
                },
                function (response) {
                    console.log(response);
                }
            );
        }

        getLesson();

        $scope.lesson = {};
    }]);