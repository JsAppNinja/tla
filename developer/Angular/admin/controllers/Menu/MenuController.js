app.controller('MenuController', ['$scope', 'UsersModel', function ($scope, UsersModel) {

    UsersModel.getRequestsCount().success(function (result) {
        $scope.requestsCount = result;
    });

    UsersModel.getTutorStudentsCount().success(function (result) {
        $scope.studentsCount = result;
    });


    $scope.requestsCount = 0;
    $scope.studentsCount = 0;
}]);