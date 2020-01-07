/**
 * Created by supostat on 23.03.16.
 */

app.controller('TutorViewProfileController', ['$scope', 'ENDPOINT_URI', '$http', 'Notification', '$sce',
    function ($scope, ENDPOINT_URI, $http, Notification, $sce) {
        function getTutor(id) {
            $http.get(ENDPOINT_URI + 'tutors/' + id).then(
                function (response) {
                    $scope.tutor = response.data;
                    $scope.tutor.iframe = $sce.trustAsHtml($scope.tutor.iframe);
                    console.log($scope.tutor);
                },
                function (response) {
                }
            );
        }

        $scope.getYoutubeId = function (url) {
            if(url) {
                var regexp = '(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})';
                var match = url.match(regexp);
                if(match) {
                    return 'https://www.youtube.com/embed/' + match[1];
                }
                return false;
            }
        };

        $scope.sendRequest = function (tutor) {
            $http.post(ENDPOINT_URI + 'student/send-request', tutor).then(
                function () {
                    Notification.success({
                        message: 'Successfully send',
                        title: 'Request'
                    });
                    tutor.requested = true;
                },
                function (response) {
                    Notification.error({
                        message: response.data
                    });
                }
            );
        };

        $scope.getTutor = getTutor;

        $scope.tutor = {};
    }]);