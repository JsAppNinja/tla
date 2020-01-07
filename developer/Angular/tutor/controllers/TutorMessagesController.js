/**
 * Created by igorpugachev on 18.04.16.
 */

app.controller('TutorMessagesController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams', '$interval', '$timeout', '$rootScope',
    function ($scope, $http, ENDPOINT_URI, $stateParams, $interval, $timeout, $rootScope) {
        var chat_id = $stateParams.chat_id;

        function getMessages() {
            $http.get(ENDPOINT_URI + 'chat/getMessages/' + chat_id).then(function (response) {
                $scope.messages = response.data;
            });
        }

        getMessages();

        $scope.sendMessage = function () {

            $scope.newMessage.chat_id = chat_id;

            $http.post(ENDPOINT_URI + 'chat/sendMessage', $scope.newMessage).then(function (response) {

                $scope.messages.push(response.data);
                
                $timeout(function () {
                    $scope.element.updateScrollbar('scrollTo', 'bottom');
                }, 200);

                $scope.newMessage = {};
            });
        };

        $scope.getTime = function (time) {

            return moment(time * 1000).calendar();

        };

        function checkMessages() {
            $http.get(ENDPOINT_URI + 'chat/checkMessages/' + chat_id).then(function (response) {
                if(response.data.length) {
                    angular.forEach(response.data, function (item) {
                        $scope.messages.push(item);
                    });
                    $timeout(function () {
                        $scope.element.updateScrollbar('scrollTo', 'bottom');
                    }, 200);
                }
            });
        }

        function getLastMessages() {
            var data = {
                count: $scope.messages.length,
                chat_id: chat_id
            };
            $http.get(ENDPOINT_URI + 'chat/getLastMessages', {params: data}).then(function (response) {
                if(response.data.length) {
                    angular.forEach(response.data, function (item) {
                        $scope.messages.unshift(item);
                    });
                    $scope.element.updateScrollbar('scrollTo', '#message_' + (response.data.length - 1));
                }
            });

        }

        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                $interval.cancel(stopMessages);
            });


        var stopMessages = $interval(function () {
            checkMessages();
        }, 2000);


        $scope.element = {};
        $scope.element.config = {
            autoHideScrollbar: true,
            theme: 'dark-thick',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: 500,
            scrollInertia: 0,
            callbacks: {
                onInit: function () {
                    $scope.element.updateScrollbar('scrollTo', 'bottom');
                },
                onScroll: function (el) {
                    if (this.mcs.top == 0) {
                        console.log(this.mcs.top);
                        getLastMessages(this);
                    }
                }
            }
        };

        $scope.messages = [];
        $scope.newMessage = {};
    }
])
;