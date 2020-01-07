/**
 * Created by igorpugachev on 18.04.16.
 */

app.controller('StudentChatController', ['$scope', '$http', 'ENDPOINT_URI',
    function ($scope, $http, ENDPOINT_URI) {
        function getTutors() {
            $http.get(ENDPOINT_URI + 'chat/getChats').then(function (response) {
                $scope.chats = response.data;
            });
        }

        getTutors();

        $scope.getAvatar = function (chat) {
            if(chat.avatar) {
                return chat.avatar;
            }
            return '/images/no_avatar2.png';
        };

        $scope.chats = [];
    }
]);