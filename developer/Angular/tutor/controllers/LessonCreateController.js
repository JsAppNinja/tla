/**
 * Created by supostat on 22.03.16.
 */

app.controller('LessonCreateController', ['$scope', 'ENDPOINT_URI', '$http', '$stateParams', '$state',
    function ($scope, ENDPOINT_URI, $http, $stateParams, $state) {

        $scope.saveLesson = function (lesson) {
            lesson.subject_id = $stateParams.subject_id;
            $http.post(ENDPOINT_URI + 'lessons', lesson).then(
                function (response) {
                    $state.go('grade-index.level.subject.lessons', {}, {reload: true});
                },
                function (response) {
                    console.log(response);
                }
            );
        };

        $scope.lesson = {};
    }]);