/**
 * Created by supostat on 22.03.16.
 */

app.controller('ProfileController', ['$scope', '$http', 'ENDPOINT_URI', 'Notification', 'ngDialog', '$base64', 'Upload', '$sce',
    function ($scope, $http, ENDPOINT_URI, Notification, ngDialog, $base64, Upload, $sce) {
        function getProfileInfo() {
            $http.get(ENDPOINT_URI + 'tutor/get-profile-info').then(
                function (response) {
                    $scope.profile = response.data;
                },
                function (response) {
                    console.log(response);
                }
            );
        }

        getProfileInfo();

        $scope.saveProfile = function () {
            $http.put(ENDPOINT_URI + 'tutor/update', $scope.profile).then(
                function (response) {
                    Notification.success({
                        message: 'Successfully updated',
                        title: 'Profile'
                    });
                },
                function (response) {

                }
            );
        };

        $scope.changeAvatar = function () {
            ngDialog.openConfirm({
                template: '/templates/change-avatar.tpl.html',
                scope: $scope,
                className: 'ngdialog-theme-default cropAvatarDialog'
            }).then(function (avatar) {
                console.log(avatar);
                $http.post(ENDPOINT_URI + 'tutor/update-avatar', avatar).then(
                    function () {
                        getProfileInfo();
                    }
                );
            })
        };

        $scope.profile = {};
        $scope.avatar = {};
        $scope.avatar.original = '';
        $scope.avatar.cropped = '';
        $scope.avatar.coords = '';

        $scope.handleFileSelect = function (evt) {
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.avatar.original = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };

        $scope.openAddSampleVideoDialog = function () {
            getTicket();
            ngDialog.open({
                template: '/templates/tutor/dialogs/profile-video.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            })
        };

        $scope.upload = function (file, video) {
            $scope.loader = Upload.http({
                url: $scope.ticket.upload_link_secure,
                headers: {
                    'Content-Type': file.type
                },
                method: 'PUT',
                data: file
            }).then(function (resp) {
                var data = {
                    complete_uri: $scope.ticket.complete_uri,
                };
                return $http.post(ENDPOINT_URI + 'tutors/addSampleVideo', data).then(function (response) {
                    getSampleVideo();
                    $scope.uploaded = true;
                });
            }, function (resp) {
                console.log('Error status: ' + resp);
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        function getTicket() {
            $http.get(ENDPOINT_URI + 'videos/getTicket').then(function (response) {
                $scope.ticket = response.data;
            });
        }

        function getSampleVideo() {
            $http.get(ENDPOINT_URI + 'tutors/getSampleVideo').then(function (response) {
                getProfileInfo();
                if(response.data) {
                    $scope.sampleVideo = $sce.trustAsHtml(response.data);
                } else {
                    $scope.sampleVideo = '';
                }
            })
        }

        $scope.openDeleteVideoDialog = function (video) {
            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/delete-video.tpl.html',
                scope: $scope
            }).then(function () {
                $http.delete(ENDPOINT_URI + 'tutors/removeSampleVideo').then(function () {
                    getProfileInfo();
                    getSampleVideo();
                });
            });
        };

        getSampleVideo();

        $scope.ticket = {};
        $scope.newVideo = {};
        $scope.sampleVideo = '';
    }]);