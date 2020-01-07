/**
 * Created by igorpugachev on 28.04.16.
 */

app.controller('AssignmentsCommentController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams', 'Notification',
    function ($scope, $http, ENDPOINT_URI, $stateParams, Notification) {

        var student_id = $stateParams.student_id;
        var assignment_id = $stateParams.assignment_id;

        function getComments() {
            $http.get(ENDPOINT_URI + 'assignments/getComment/' + $stateParams.assignment_id, {params: {student_id: student_id }}).then(function (response) {
                $scope.messages = response.data;
            });
        }

        $scope.getAvatar = function (data, comment) {
            if(comment.owner_type == 0) {
                return data.student_avatar;
            };

            if(comment.owner_type == 1) {
                return data.tutor_avatar;
            }
        };

        getComments();

        $scope.addComment = function () {
            var data = {
                student_id: student_id,
                assignment_id: $stateParams.assignment_id,
                body: $scope.tutor.newComment
            };

            $http.post(ENDPOINT_URI + 'assignments/addComment', data).then(function (response) {
                $scope.messages.data.push(response.data);
            });
        };

        $scope.messages = [];

        $scope.student = {};
        $scope.tutor = {};
    }]);