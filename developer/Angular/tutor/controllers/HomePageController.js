/**
 * Created by igorpugachev on 04.05.16.
 */

app.controller('HomePageController', ['$scope', '$http', 'ENDPOINT_URI', 'ngDialog', '$sce',
    function ($scope, $http, ENDPOINT_URI, ngDialog, $sce) {

        function getVideos() {
            $http.get(ENDPOINT_URI + 'videos/getTutorHelpVideo').then(function (response) {
                $scope.tutorsVideos = response.data;

                angular.forEach($scope.tutorsVideos, function (item) {
                    item.video.HTMLiframe = $sce.trustAsHtml(item.video.iframe);
                });
            });
        }

        getVideos();

        $scope.showVideo = function (tutorVideo) {
            $scope.showingVideo = tutorVideo.video;
            $scope.showingVideo.description = tutorVideo.description;

            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/view-video.tpl.html',
                scope: $scope,
                className: 'ngdialog-theme-default showing-video'
            }).then(function () {

            });
        };


        $scope.tutorsVideos = [];
    }]);