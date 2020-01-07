app.controller('TutorStudentsResultsController', ['$scope', '$http', 'ENDPOINT_URI', 'ngDialog',
    function ($scope, $http, ENDPOINT_URI, ngDialog) {

        function getStudents() {
            $http.get(ENDPOINT_URI + 'tutors/getStudents').then(function (response) {
                $scope.students = response.data;
                getResults();
            });
        }

        function getResults(student) {
            var url = 'tutors/getStudentsResults';
            var params = {};
            if(student) {
                params = {id: student.id};
            }

            $http.get(ENDPOINT_URI + url, {params: params}).then(function (response) {
                $scope.results = response.data;
            });
        }

        getStudents();

        $scope.onStudentSelect = function (student) {
            getResults(student);
        };

        $scope.students = [];
        $scope.student = {};

        $scope.results = [];

        $scope.resultHtml = {
            html: ''
        };

    }]);