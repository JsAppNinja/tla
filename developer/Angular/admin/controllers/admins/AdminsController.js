/**
 * Created by igorpugachev on 10.05.16.
 */

app.controller('AdminsController', ['$scope', '$http', 'Notification', 'ENDPOINT_URI', 'ngDialog',
    function ($scope, $http, Notification, ENDPOINT_URI, ngDialog) {
        function getAdmins() {
            $http.get(ENDPOINT_URI + 'users/getAdmins').then(function (response) {
                $scope.admins = response.data;
            });
        }

        $scope.openAddAdminDialog = function () {
            ngDialog.open({
                template: '/templates/admin/dialogs/admin-new.tpl.html',
                scope: $scope
            });
        };

        $scope.addAdmin = function (admin, closeCallback) {
            $http.post(ENDPOINT_URI + 'users/createAdmin', admin).then(function (response) {
                getAdmins();
                closeCallback(0);
            });
        };

        $scope.deleteAdmin = function (admin, index) {
            $http.delete(ENDPOINT_URI + 'users/deleteAdmin/' + admin.id).then(function (response) {
                $scope.admins.splice(index, 1);
            });
        };

        getAdmins();

        $scope.admins = [];
    }]);