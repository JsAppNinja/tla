/**
 * Created by supostat on 24.03.16.
 */

app.controller('StudentsRequestsController', ['$http', 'ENDPOINT_URI', '$scope', 'Notification',
    function ($http, ENDPOINT_URI, $scope, Notification) {
        $scope.title = 'Students requests';

        function getStudentsRequests() {
            $http.get(ENDPOINT_URI + 'tutor/get-students-requests').then(
                function (response) {
                    $scope.students = response.data;
                },
                function (response) {}
            );
        }

        getStudentsRequests();

        $scope.acceptStudent = function (student, index) {
            student.sending = true;
            $http.post(ENDPOINT_URI + 'tutor/accept-student', student).then(
                function () {
                    Notification.success({
                        message: 'Successfully accepted',
                        title: 'Accept student'
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

        $scope.rejectStudent = function (student, index) {
            student.sending = true;
            $http.post(ENDPOINT_URI + 'tutor/reject-student', student).then(
                function () {
                    Notification.success({
                        message: 'Successfully rejected',
                        title: 'Reject student'
                    });
                    $scope.students.splice(index, 1);
                    student.sending = false;
                },
                function (response) {
                    Notification.error({
                        message: response.data
                    });
                }
            );
        };

        $scope.students = [];
    }]);