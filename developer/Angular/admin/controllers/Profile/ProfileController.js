/**
 * Created by supostat on 28.12.15.
 */


app.controller('ProfileController', ['$scope', '$http', 'UsersModel', 'Notification', 'SubjectsModel', 'ngDialog', '$window',
    function ($scope, $http, UsersModel, Notification, SubjectsModel, ngDialog, $window) {

        function sexSelect(sex) {
            $scope.user.sex = sex.id;
        }

        function getAvatarSrc() {
            if($scope.user) {
                if($scope.user.avatar) return $scope.user.avatar.thumb;
                if($scope.user.sex == 1) return '/images/nophoto-male.jpg';
                if($scope.user.sex == 0) return '/images/nophoto-female.jpg';
            }
        }

        function getUserData() {
            UsersModel.getCurrentUser().then(function (result) {
                for (var i in $scope.statuses) {
                    if ($scope.statuses[i].id == result.data.status) {
                        result.data.status = $scope.statuses[i];
                    }
                }
                $scope.visualDate = moment(result.data.dateBirth).isValid()?moment(result.data.dateBirth).format('LL'):'';
                if(result.data.sex != null) {
                    $scope.sexVisual = $scope.sexs[result.data.sex];
                }
                if(!result.data.avatar) {
                    if(!result.data.sex) {
                        result.data.sex = $scope.sexs[0].id;
                        $scope.sexVisual = $scope.sexs[1];
                    }
                }
                $scope.user = result.data;
                if(!$scope.user.experience) $scope.user.experience = 0;
                getSubjectsList();
            })
        }

        $scope.uploadAvatar = function (file) {
            if(file) {
                $scope.file = file;
                ngDialog.openConfirm({
                    template: '/templates/dialogs/cropavatar.html',
                    scope: $scope,
                    className: 'ngdialog-theme-default cropAvatarDialog'
                }).then(function (file) {
                    $scope.user.avatar = file;
                });
            }
        };

        function saveProfile() {

            var user = angular.copy($scope.user);
            user.status = user.status.id;
            user.dateBirth = moment(user.dateBirth).format('YYYY-MM-DD HH:mm:ss');
            user.avatar = $scope.user.avatar;
            user.tutorSubjects = $scope.tutorSubjects;
            user.coordinates = $scope.coordinates;
            UsersModel.saveProfile(user).then(function (result) {
                if (result.data) {
                    Notification.success({
                        message: 'Update complete',
                        title: 'Update'
                    });
                } else {
                    Notification.error({
                        message: 'Error',
                        title: 'Update'
                    });
                }
            })
        }

        function toggleSubjects(subject) {
            console.log(subject);
        }

        function getSubjectsList() {
            SubjectsModel.getSubjectsList().then(function (result) {
                $scope.subjects = result.data;
                for(var i in $scope.subjects) {
                    for(var j in $scope.user.subjects) {
                        if($scope.subjects[i].id == $scope.user.subjects[j].id) {
                            $scope.subjects[i].selected = true;
                            $scope.tutorSubjects.push($scope.user.subjects[j].id);
                        }
                    }
                }
            });
        }

        $scope.selected = function (cords) {
            $scope.coordinates = cords;
            var scale;
            $scope.picWidth = cords.w;
            $scope.picHeight = cords.h;

            if ($scope.picWidth > 200) {
                scale = (200 / $scope.picWidth);
                $scope.picHeight *= scale;
                $scope.picWidth *= scale;
            }

            if ($scope.picHeight > 200) {
                scale = (200 / $scope.picHeight);
                $scope.picHeight *= scale;
                $scope.picWidth *= scale;
            }

            $scope.cropped = true;

            var rx = 200 / cords.w,
                ry = 200 / cords.h;

            $window.jQuery('img#preview').css({
                width: Math.round(rx * cords.bx) + 'px',
                height: Math.round(ry * cords.by) + 'px',
                marginLeft: '-' + Math.round(rx * cords.x) + 'px',
                marginTop: '-' + Math.round(ry * cords.y) + 'px'
            });
        };

        $scope.onBirthSet = function (newDate) {
            $scope.visualDate = moment(newDate).format('LL');
        };

        $scope.$watch('sexVisual', function (sex) {
            if(sex) {
                $scope.user.sex = sex.id;
            }
        });

        $scope.$watch('subjects|filter:{selected:true}', function (nv) {
            $scope.tutorSubjects = nv.map(function (subject) {
                return subject.id;
            });
        }, true);

        $scope.user = {};
        $scope.visualDate = null;
        $scope.sex = {};
        $scope.sexs = [{id: 0, value: 'Female'},{id: 1, value: 'Male'}];
        $scope.statuses = [{id: 1, value: 'Accepting students'}, {id: 0, value: 'Not Accepting students'}];
        $scope.sexSelect = sexSelect;
        $scope.saveProfile = saveProfile;
        $scope.toggleSubjects = toggleSubjects;
        $scope.getAvatarSrc = getAvatarSrc;
        $scope.subjects = [];
        $scope.tutorSubjects = [];


        getUserData();
    }]);