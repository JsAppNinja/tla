app.controller('UserProfileController', ['$scope', 'UsersService', 'Notification', 'ngDialog',
    function ($scope, UsersService, Notification, ngDialog) {

    UsersService.getRolesTypes().then(function (result) {
        $scope.rolesTypes = result.data;
        $scope.roleType.selected = result.data[0];
        UsersService.getUsers().then(function (result) {
            $scope.users = result.data;
        });
    });

    var selectRole = function () {
        var role = $scope.roleType.selected;
        UsersService.getUsers(role).then(function (result) {
            $scope.users = result.data;
        });
    };

    var deleteUser = function (index) {
        $scope.deletedUser = $scope.users[index];
        ngDialog.openConfirm({
            template: 'deleteUserTemplate',
            scope: $scope,
            showClose: false
        }).then(function () {
            UsersService.deleteUser($scope.users[index]).then(function (result) {
                Notification.success({
                    message: $scope.users[index].first_name + ' ' + $scope.users[index].last_name + ' has been deleted',
                    title: 'User deleting'
                });
                $scope.users.splice(index, 1);
            });
        });
    };

    $scope.users = [];
    $scope.rolesTypes = [];
    $scope.roleType = {};

    $scope.deletedUser = {};
    $scope.deleteUser = deleteUser;
    $scope.selectRole = selectRole;
}]);