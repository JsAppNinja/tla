/**
 * Created by supostat on 22.03.16.
 */

app.controller('ProfileSubjectController', ['$scope', '$http', 'ENDPOINT_URI', 'Notification',
    function ($scope, $http, ENDPOINT_URI, Notification) {
        function getSubjects() {
            $http.get(ENDPOINT_URI + 'subject/get-subjects-list').then(
                function (response) {
                    $scope.subjects = response.data;
                    $http.get(ENDPOINT_URI + 'tutor/get-subjects').then(
                        function (response) {
                            $scope.tutorSubjects = response.data;
                        },
                        function (response) {
                            console.log(response.data);
                        }
                    );
                },
                function (response) {
                    console.log(response);
                }
            );
        }

        getSubjects();

        $scope.saveSubjects = function () {
            $http.put(ENDPOINT_URI + 'tutor/save-subjects', $scope.tutorSubjects).then(
                function (response) {
                    Notification.success({
                        message: 'Successfully updated',
                        title: 'Subjects'
                    });
                },
                function (response) {
                    Notification.error({
                        message: response.data,
                    });
                }
            );
        };

        $scope.subjects = [];
        $scope.tutorSubjects = [];
    }]);