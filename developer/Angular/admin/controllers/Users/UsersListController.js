app.controller('UsersListController', ['UsersListModel', '$scope', 'ngDialog', 'ENDPOINT_URI', '$http', '$rootScope', '$filter',
    function (UsersListModel, $scope, ngDialog, ENDPOINT_URI, $http, $rootScope, $filter) {
        var $templates_path = '/templates/admin/dialogs/';

        function giveManualSubscription(user, manualSubscription) {
            var data = {
                user: user,
                subscription: manualSubscription
            };

            $http.post(ENDPOINT_URI + 'subscriptions', data).then(function (result) {
                getUsersList();
            })
        }


        function getUsersList() {
            UsersListModel.getUsersList().then(function (result) {
                $scope.users = result.data.users;
                $scope.filteredUsers =  $filter('filter')($scope.users, {deleted: false});
                $scope.registered = {
                    'tutors': result.data.tutors,
                    'students': result.data.students,
                    'schools': result.data.schools,
                };
            });
        }

        getUsersList();
        $scope.giveManualSubscriptionDialog = function (user) {
            ngDialog.openConfirm({
                template: $templates_path + 'give-manual-student-subscription.tpl.html',
                scope: $scope,
                data: {
                    userTitle: user.user_type == 2 ? 'tutor' : 'student'
                }
            }).then(function (manualSubscription) {
                giveManualSubscription(user, manualSubscription);
            });
        };

        $scope.selectUserType = function (userType) {
            if (userType) {
                if (userType.id == 12) {
                    $scope.filteredUsers = $filter('filter')($scope.users, {deleted: true});
                } else {
                    $scope.filteredUsers = $filter('filter')($scope.users, {user_type: userType.id, deleted: false}, true);
                }
            } else {
                $scope.filteredUsers =  $filter('filter')($scope.users, {deleted: false});
            }
        };

        $scope.deleteUser = function (user, index) {
            $http.delete(ENDPOINT_URI + 'users/' + user.id).then(function (result) {
                user.deleted = true;
                $scope.filteredUsers =  $filter('filter')($scope.users, {deleted: false});
            });
        };
        $scope.restoreUser = function (user, index) {
            $http.post(ENDPOINT_URI + 'users/restore/' + user.id).then(function (result) {
                user.deleted = false;
                $scope.filteredUsers =  $filter('filter')($scope.users, {deleted: true});
            });
        };

        $scope.showUserSubscriptionDialog = function (user) {
            $http.get(ENDPOINT_URI + 'subscriptions/' + user.id).then(function (result) {
            });
        };

        $scope.userTypes = [
            {
                id: 1,
                name: 'Students'
            },
            {
                id: 2,
                name: 'Tutors'
            },
            {
                id: 11,
                name: 'Admins'
            },
            {
                id: 12,
                name: 'Deactivated'
            }
        ];
        $scope.filteredUsers = [];
        $scope.manualSubscription = {};
        $scope.manualSubscription.month = 1;
        $scope.users = [];
        $scope.subscribed = true;
    }]);
