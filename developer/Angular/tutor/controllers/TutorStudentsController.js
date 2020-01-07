/**
 * Created by supostat on 24.03.16.
 */

app.controller('TutorStudentsController', ['$http', 'ENDPOINT_URI', '$scope', 'Notification',
    function ($http, ENDPOINT_URI, $scope, Notification) {
        $scope.title = 'My students';

        function getStudentsRequests() {
            $http.get(ENDPOINT_URI + 'tutor/get-students').then(
                function (response) {
                    $scope.students = response.data;
                },
                function (response) {}
            );
        }

        getStudentsRequests();

        $scope.dismissStudent = function (student, index) {
            student.sending = true;

            $http.post(ENDPOINT_URI + 'tutor/dismiss-student', student).then(
                function () {
                    Notification.success({
                        message: 'Successfully dismissed',
                        title: 'Dismiss student'
                    });
                    $scope.students.splice(index, 1);
                    student.sending = false;
                },
                function (response) {
                    Notification.error({
                        message: response.data,
                    });
                }
            );
        };

        $scope.getAvatar = function (student) {
            if(student.avatar) {
                return '/uploads/avatars/students/' + student.id + '/' + student.avatar;
            }
            return '/images/no_avatar2.png';
        };

        $scope.students = [];

    }]);