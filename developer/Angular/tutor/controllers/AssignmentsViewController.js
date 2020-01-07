/**
 * Created by igorpugachev on 28.04.16.
 */

app.controller('AssignmentsViewController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams', 'Notification',
    function ($scope, $http, ENDPOINT_URI, $stateParams, Notification) {

        function getAssignment() {
            $http.get(ENDPOINT_URI + 'assignments/getAssignmentData/' + $stateParams.assignment_id, {params: {subject_id: $stateParams.subject_id}}).then(function (response) {
                $scope.assignment = response.data;
            });
        }

        getAssignment();

        $scope.getStudentAvatar = function (student) {
            console.log(student);
            if(student.avatar) {
                return '/uploads/avatars/students/' + student.id + '/' + student.avatar;
            } else {
                return '/images/no_avatar2.png';
            }
        };

        $scope.assignment = {};
        $scope.tutor = {};
    }]);