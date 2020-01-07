app.controller('ProfileSettingsController', ['$scope', '$http', 'Notification', 'ENDPOINT_URI',
    function ($scope, $http, Notification, ENDPOINT_URI) {

        $scope.changePassword = function (password) {
            $scope.btnDisabled = true;
            $http.post(ENDPOINT_URI + 'users/changePassword', password).then(function (response) {
                $scope.btnDisabled = false;
                Notification.success({
                    message: 'Successfully updated',
                    title: 'Password'
                });
            }, function (response) {
                $scope.btnDisabled = false;
                Notification.error({
                    message: response.data.message,
                    title: 'Password'
                });
            });
        };

        $scope.getDisabled = function (password) {
            if($scope.frmChangePassword.$invalid) {
                return true;
            }
            if(password.newPassword != '' && (password.newPassword != password.confirmNewPassword)) {
                return true;
            }
            if($scope.btnDisabled) {
                return true;
            }

            return false;
        };

        $scope.password = {};
        $scope.password.newPassword = '';
        $scope.password.confirmNewPassword = '';
        $scope.btnDisabled = false;

    }]);