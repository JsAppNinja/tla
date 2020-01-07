/**
 * Created by igorpugachev on 18.04.16.
 */

app.controller('StudentMessagesController', ['$scope', '$http', 'ENDPOINT_URI', '$interval', '$timeout',
    function ($scope, $http, ENDPOINT_URI, $interval, $timeout) {

        var chat_id;

        $scope.onInit = function (id) {
            chat_id = id;

            getMessages(chat_id);

            $interval(function () {
                checkMessages();
            }, 1000);

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

        function getMessages(tutor_id) {
            $http.get(ENDPOINT_URI + 'chat/getMessages/' + chat_id).then(function (response) {
                if(response.data.length > $scope.messages.length) {
                    $timeout(function () {
                        $scope.element.updateScrollbar('scrollTo', 'bottom');
                    }, 200);
                }
                $scope.messages = response.data;
            });
        }


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
        $scope.element = {};

        $scope.element.config = {
            autoHideScrollbar: true,
            theme: 'dark-thick',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: 500,
            scrollInertia: 0,
            callbacks:{
                onInit: function(){
                    $scope.element.updateScrollbar('scrollTo', 'bottom');
                },
                onScroll:function(el){
                    // console.log(this.mcs);
                }
            }
        };
        $scope.messages = [];
        $scope.newMessage = {};
    }
])
;