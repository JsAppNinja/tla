/**
 * Created by supostat on 06.01.16.
 */

app.controller('SearchController', ['$scope', 'UsersModel', 'SubjectsModel', function ($scope, UsersModel, SubjectsModel) {

    $scope.userTypes = [
        {id: 2, value: 'Tutor'},
        {id: 3, value: 'School'}
    ];

    function getSubjects() {
        SubjectsModel.getSubjectsListByUserType().then(function (result) {
            $scope.subjects = result.data;
        });
    }

    $scope.search = {};
    $scope.userType = {};
    $scope.search.userType = $scope.userTypes[0];
    $scope.names = [];

    $scope.selectUserType = function (userType) {
        console.log($scope.users);
        if (userType) {
            search();
        }
    };

    function search() {
        var request = {
            userType: $scope.search.userType.id,
            userName: $scope.search.userName ? $scope.search.userName.name : undefined,
            userSubject: $scope.search.subject ? $scope.search.subject.id : undefined
        };
        UsersModel.searchUsers(request).then(function (result) {
            $scope.users = result.data;
            if (!$scope.names.length) {
                $scope.names = result.data;
            }
        });
    }

    $scope.writeSubjects = function (user) {
        if (user) {
            return user.subjects.map(function (elem) {
                return elem.name;
            }).join(", ");
        }
    };

    $scope.getAvatarSrc = function (user) {
        if (user) {
            if (user.avatar) return user.avatar.thumb;
            if (user.sex == 1) return '/images/nophoto-male.jpg';
            if (user.sex == 0) return '/images/nophoto-female.jpg';
        }
    };

    $scope.selectUserName = function (userName) {
        search();
    };

    $scope.selectSubject = function (subjectId) {
        search();
    };

    $scope.sendRequest = function (user) {
        var request = {
            id: user.id,
            type: $scope.search.userType.id
        };

        UsersModel.sendRequest(request).then(function (result) {
            user.requested = result.data;
        });
    };

    $scope.view = '/templates/views/list.html';

    $scope.showBlocks = function () {
        $scope.listView = 'blocks';
    };

    getSubjects();
    search();
}]);