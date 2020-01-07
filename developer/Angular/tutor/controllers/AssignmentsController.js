/**
 * Created by igorpugachev on 28.04.16.
 */

app.controller('AssignmentsController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams', 'Notification',
    function ($scope, $http, ENDPOINT_URI, $stateParams, Notification) {

        function getAssignmens() {
            $http.get(ENDPOINT_URI + 'assignments/getAssignments', {params: {lesson_id: $stateParams.lesson_id}}).then(function (response) {
                $scope.assignments = response.data;
            });
        }

        getAssignmens();
        
        $scope.deleteAssignment = function (assignment, index) {
            $http.delete(ENDPOINT_URI + 'assignments/' + assignment.id).then(function () {
                Notification.success({
                    message: 'Successfully deleted',
                    title: 'Assignment'
                });
                $scope.assignments.splice(index, 1);
            });
        };

        $scope.assignments = [];
    }]);