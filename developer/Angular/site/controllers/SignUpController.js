/**
 * Created by supostat on 21.12.15.
 */

"use strict";

app.controller("SignUpController", ['$scope', function ($scope) {

    $scope.userTypeSelect = function (type) {
        for (var i in $scope.usertypes) {
            $scope.usertypes[i].selected = false;
        }
        type.selected = true;
    };

    $scope.sexSelect = function (sex) {
        console.log(sex);
    };

    $scope.onBirthSet = function (newDate) {
        $scope.visualDate = moment(new Date(newDate)).format('DD MMMM YYYY');
    };

    $scope.usertypes = [
        {id: 1, name: 'Student', selected: true},
        {id: 2, name: 'Teacher', selected: false},
        {id: 3, name: 'School', selected: false}
    ];

    $scope.sexs = [
        {id: 1, name: 'Male'},
        {id: 0, name: 'Female'}
    ];

    $scope.visualDate = null;
    $scope.user = {};
    $scope.user.type = {};
    $scope.user.type.selected = $scope.usertypes[0];

}]);