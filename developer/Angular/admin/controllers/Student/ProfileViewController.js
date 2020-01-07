app.controller('ProfileViewController', ['$scope', '$stateParams',
    function ($scope, $stateParams) {

        function getStudent() {

        }

        $scope.id = $stateParams.id;
        $scope.student = {};

        $scope.getStudent = getStudent;
    }
]);