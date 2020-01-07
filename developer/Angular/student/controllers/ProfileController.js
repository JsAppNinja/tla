/**
 * Created by supostat on 28.12.15.
 */


app.controller('StudentProfileController', ['$scope', '$http', 'Notification', '$timeout', '$window', 'ngDialog', 'ENDPOINT_URI',
    function ($scope, $http, Notification, $timeout, $window, ngDialog, ENDPOINT_URI) {

        function getUserData() {
            console.log(ENDPOINT_URI);
            $http.get(ENDPOINT_URI + 'students/getProfileData').then(function (response) {
                console.log(response.data);
                $scope.profile = response.data;
            });
        }

        getUserData();

        $scope.changeAvatar = function () {
            ngDialog.openConfirm({
                template: '/templates/change-avatar.tpl.html',
                scope: $scope,
                className: 'ngdialog-theme-default cropAvatarDialog'
            }).then(function (avatar) {
                console.log(avatar);
                $http.post(ENDPOINT_URI + 'student/update-avatar', avatar).then(
                    function () {
                        getUserData();
                    }
                );
            })
        };

        $scope.handleFileSelect = function (evt) {
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            console.log(reader);
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.avatar.original = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };

        $scope.saveProfile = function (profile) {
            $http.post(ENDPOINT_URI + 'students/saveProfile', profile).then(function (response) {
                Notification.success({
                    message: 'Successfully updated',
                    title: 'Profile'
                });
            });
        };

        $scope.changePassword = function (password) {
            $scope.btnDisabled = true;
            $http.post(ENDPOINT_URI + 'students/changePassword', password).then(function (response) {
                $scope.btnDisabled = false;
                Notification.success({
                    message: 'Successfully updated',
                    title: 'Password'
                });
            }, function () {
                $scope.btnDisabled = false;
                Notification.error({
                    message: 'Error',
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
        $scope.profile = {};
        $scope.avatar = {};
        $scope.avatar.original = '';
        $scope.avatar.cropped = '';
        $scope.avatar.coords = '';
        $scope.btnDisabled = false;


    }]);