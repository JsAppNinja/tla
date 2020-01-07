/**
 * Created by supostat on 30.03.16.
 */


app.controller('TutorVideoController', ['$scope', '$http', 'ENDPOINT_URI', '$sce', 'Upload', 'ngDialog', '$stateParams',
    function ($scope, $http, ENDPOINT_URI, $sce, Upload, ngDialog, $stateParams) {
         function loadVideo() {
            $http.get(ENDPOINT_URI + 'tutors/loadVideo').then(function (response) {
                $scope.vimeoData = response.data.body;
            });
        }
        //loadVideo();

        $scope.submit = function(video, newVideo) {
            $scope.upload(video);
        };
        $scope.upload = function(file, videoData) {
            console.log(file);
            $scope.loader = Upload.http({
                url: $scope.vimeoData.upload_link_secure,
                headers : {
                    'Content-Type': file.type
                },
                method: 'PUT',
                data: file
            }).then(function (resp) {
                $scope.vimeoData.lesson_id = $stateParams.lesson_id;
                $scope.vimeoData.title = videoData.title;
                $scope.vimeoData.description = videoData.description;
                return $http.post(ENDPOINT_URI + 'tutors/testVideo', $scope.vimeoData).then(function (response) {
                    $scope.uploaded = true;
                    getVideos();
                });
            }, function (resp) {
                console.log('Error status: ' + resp);
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        function getVideos() {
            $http.get(ENDPOINT_URI + 'tutors/getVideos', {params: {lesson_id: $stateParams.lesson_id}}).then(function (response) {
                $scope.videos = [];
                angular.forEach(response.data, function (item, index) {
                    var video_item = {};
                    video_item.HTMLiframe = $sce.trustAsHtml(item.iframe);
                    video_item.iframe = item.iframe;
                    video_item.title = item.title;
                    video_item.id = item.id;
                    video_item.description = item.description;
                    video_item.status = item.status;
                    if(item.status == 1) {
                        video_item.preview_img = item.preview_img;
                    } else {
                        video_item.preview_img = '/images/processing.gif';
                    }
                    $scope.videos.push(video_item);
                });
                console.log($scope.videos);
            });
        }
        getVideos();

        $scope.openEditVideoDialog = function (video) {
            $scope.uploaded = false;
            $scope.newVideo = angular.copy(video);
            $scope.edited = true;
            ngDialog.open({
                template: '/templates/tutor/dialogs/video-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.openDeleteVideoDialog = function (video) {
            $scope.deletedVideo = video;
            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/delete-video.tpl.html',
                scope: $scope
            }).then(function (video) {
                $http.delete(ENDPOINT_URI + 'tutors/deleteVideo/' + video.id).then(function (response) {
                    getVideos();
                });
            });
        };

        $scope.openAddVideoDialog = function () {
            loadVideo();
            $scope.edited = false;
            $scope.uploaded = false;
            $scope.newVideo = {};
            ngDialog.open({
                template: '/templates/tutor/dialogs/video-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.updateVideo = function (video, dialog) {
            $http.put(ENDPOINT_URI + 'tutors/updateVideo', video).then(function (response) {
                getVideos();
            });
            dialog.closeThisDialog(0);
        };

        $scope.showVideo = function (video) {
            $scope.showingVideo = video;
            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/view-video.tpl.html',
                scope: $scope,
                className: 'ngdialog-theme-default showing-video'
            }).then(function () {

            });
        };

        $scope.video_actions = false;
        $scope.vimeoData = {};
        $scope.videoUrl = '';
        $scope.progress = 0;
        $scope.videos = [];
        $scope.edited = false;
        $scope.uploaded = false;
        $scope.deletedVideo = {};
    }]);