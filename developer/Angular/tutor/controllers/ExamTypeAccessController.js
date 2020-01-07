/**
 * Created by supostat on 05.04.16.
 */

app.controller('ExamTypeAccessController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams',
    function ($scope, $http, ENDPOINT_URI, $stateParams) {

        function getGradeStudents() {
            $http.get(ENDPOINT_URI + 'tutors/getGradeStudents/' + $stateParams.subject_id).then(function (response) {
                $scope.students = response.data;
            });
        }

        getGradeStudents();

        $scope.setState = function (student) {

            var data = {
                active: student.active,
                subject_id: $stateParams.subject_id,
                grade_id: $stateParams.level_id
            };

            $http.put(ENDPOINT_URI + 'tutors/setGradeAccess/' + student.id, data).then(function (response) {
                console.log(response.data);
            });
        };

        $scope.students = [];
    }]);