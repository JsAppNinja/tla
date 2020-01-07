/**
 * Created by igorpugachev on 18.04.16.
 */

app.controller('TutorChatController', ['$scope', '$http', 'ENDPOINT_URI', '$interval', '$rootScope',
    function ($scope, $http, ENDPOINT_URI, $interval, $rootScope) {

        function getChats() {
            $http.get(ENDPOINT_URI + 'chat/getChats').then(function (response) {
                $scope.chats = response.data;
            });
        }

        getChats();
        
        $scope.getAvatar = function (chat) {
            if(chat.avatar) {
                return chat.avatar;
            }
            return '/images/no_avatar2.png';
        };
        // function getStudents() {
        //     $http.get(ENDPOINT_URI + 'chat/getStudents').then(function (response) {
        //         $scope.students = response.data;
        //
        //         getUnreaded();
        //
        //     });
        // }
        //
        // getStudents();
        //
        // var stopUnreaded = $interval(function () {
        //     getUnreaded();
        // }, 10000);
        //
        // function getUnreaded() {
        //     $http.get(ENDPOINT_URI + 'chat/getUnreaded').then(function (response) {
        //         angular.forEach(response.data, function (item) {
        //             angular.forEach($scope.students, function (student) {
        //                 if(student.student.id == item.id) {
        //                     student.count = item.count;
        //                 }
        //             });
        //         });
        //     });
        // }
        //
        //
        // $rootScope.$on('$stateChangeSuccess',
        //     function (event, toState, toParams, fromState, fromParams) {
        //         $interval.cancel(stopUnreaded);
        //     });
        //
        //
        // $scope.students = [];
        $scope.chats = [];
    }
]);