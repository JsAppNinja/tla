/**
 * Created by supostat on 01.04.16.
 */

app.controller('AdminVideoController', ['$scope', '$http', 'ENDPOINT_URI', 'ngDialog', 'Upload', '$sce', '$timeout', '$q',
    function ($scope, $http, ENDPOINT_URI, ngDialog, Upload, $sce, $timeout, $q) {
        var uploadedCount = 0;
        var filesCount = 0;



        function getVideos() {
            $http.get(ENDPOINT_URI + 'videos').then(function (response) {
                $scope.freeVideos = [];
                $scope.payedVideos = [];
                $scope.videos = response.data;
                angular.forEach($scope.videos, function (item) {
                    item.HTMLiframe = $sce.trustAsHtml(item.iframe);
                    if (item.free == 1) {
                        $scope.freeVideos.push(item);
                    } else {
                        $scope.payedVideos.push(item);
                    }
                });
            });
        }

        function getTutorHelpVideo() {
            $http.get(ENDPOINT_URI + 'videos/getTutorHelpVideo').then(function (response) {
                $scope.tutorsVideos = response.data;

                angular.forEach($scope.tutorsVideos, function (item) {
                    item.video.HTMLiframe = $sce.trustAsHtml(item.video.iframe);
                });

            });
        }

        getTutorHelpVideo();

        function getSubjects() {
            $http.get(ENDPOINT_URI + 'subjects/getSubjectsList').then(function (response) {
                $scope.subjects = response.data;

                $scope.selectedSubject.value = $scope.subjects[0];
            });
        }

        function getTicket() {
            var deferred = $q.defer();

            $http.get(ENDPOINT_URI + 'videos/getTicket').then(function (response) {
                deferred.resolve(response.data);
            });

            return deferred.promise;
        }

        getVideos();
        getSubjects();

        $scope.addVideo = function () {
            getTicket().then(function (ticket) {
                $scope.ticket = ticket;
                $scope.edited = false;
                $scope.newVideo = {};
                $scope.newVideo.free = 0;
                $scope.uploaded = false;
                ngDialog.open({
                    template: '/templates/admin/dialogs/video-upload.tpl.html',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByNavigation: false,
                    closeByDocument: false
                });
            });
        };

        $scope.addMultiplyVideo = function () {
            $scope.edited = false;
            $scope.newMultiplyVideos = [];
            $scope.newVideo = {};
            $scope.newVideo.free = 0;
            $scope.newVideo.active = 1;
            $scope.uploaded = false;
            ngDialog.open({
                template: '/templates/admin/dialogs/video-multiply-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.addTutorHelpVideo = function () {
            $scope.edited = false;
            $scope.uploaded = false;
            $scope.newVideo = {};
            getTicket().then(function (resp) {
                $scope.ticket = resp;
            });
            ngDialog.open({
                template: '/templates/admin/dialogs/tutor-help-video-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.sortPayedConfig = {
            animation: 150,
            group: {
                name: 'payed',
                put: ['free']
            },
            delay: 0,
            ghostClass: 'sortable-ghost',
            chosenClass: "sortable-chosen",
            forceFallback: false,
            onAdd: function (/**Event*/evt) {
                evt.model.free = 0;
                saveVideoState(evt.model);
            },
            onSort: function (/**Event*/evt) {
                saveOrder('payed', $scope.payedVideos)
            }
        };

        $scope.sortFreeConfig = {
            animation: 150,
            group: {
                name: 'free',
                put: ['payed']
            },
            delay: 0,
            ghostClass: 'sortable-ghost',
            chosenClass: "sortable-chosen",
            forceFallback: false,
            onAdd: function (/**Event*/evt) {
                evt.model.free = 1;
                saveVideoState(evt.model);
            },
            onSort: function (/**Event*/evt) {
                saveOrder('free', $scope.freeVideos)
            }
        };

        $scope.sortTutorConfig = {
            animation: 150,
            delay: 0,
            ghostClass: 'sortable-ghost',
            chosenClass: "sortable-chosen",
            forceFallback: false,
            onAdd: function (/**Event*/evt) {
                evt.model.free = 1;
                saveVideoState(evt.model);
            },
            onSort: function (/**Event*/evt) {
                saveOrder('tutor', $scope.tutorsVideos)
            }
        };

        function saveOrder(type, model) {
            var data = {
                type: type,
                videos: []
            };

            angular.forEach(model, function (value, key) {
                data.videos.push({id: value.id, order: key});
            });

            $http.put(ENDPOINT_URI + 'videos/saveOrder', data);
        }

        function saveVideoState(video) {
            $http.put(ENDPOINT_URI + 'videos/saveState', video).then(function (response) {
                console.log(true);
            });
        }

        $scope.multiplyPromises = [];

        function uploadUsingUpload(file, video, index, ticket) {
            $scope.multiplyPromises[index] = Upload.http({
                url: ticket.upload_link_secure,
                headers: {
                    'Content-Type': file.type
                },
                method: 'PUT',
                data: file
            }).then(function (response) {
                var data = {
                    complete_uri: ticket.complete_uri,
                    title: video.title,
                    description: video.description,
                    subject_id: $scope.selectedSubject.value.id,
                    free: $scope.newVideo.free,
                    active: $scope.newVideo.active
                };

                $http.post(ENDPOINT_URI + 'videos/applyVideo', data);

            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        }

        $scope.upload = function (file, video) {
            $scope.loader = Upload.http({
                url: $scope.ticket.upload_link_secure,
                headers: {
                    'Content-Type': file.type
                },
                method: 'PUT',
                data: file
            }).then(function (resp) {
                var data = {
                    complete_uri: $scope.ticket.complete_uri,
                    title: video.title,
                    description: video.description,
                    subject_id: $scope.selectedSubject.value.id,
                    free: video.free
                };

                return $http.post(ENDPOINT_URI + 'videos/applyVideo', data).then(function (response) {
                    $scope.uploaded = true;
                    getVideos();
                });
            }, function (resp) {
                console.log('Error status: ' + resp);
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        $scope.newVideoFiles = [];

        $scope.uploadMultiply = function (files, videos) {
            filesCount = files.length;
            var prom = [];
            if(files.length) {
                angular.forEach(files, function (item, i) {
                    prom.push(getTicket());
                });
                $q.all(prom).then(function (data) {
                    for (var i = 0; i < files.length; i++) {
                        $scope.errorMsg = null;
                        var ticket = data[i];
                        (function (f, video, index, ticket) {
                            uploadUsingUpload(f, video, index, ticket);
                        })(files[i], videos[i], i, ticket);
                    }
                    $scope.loader = $q.all($scope.multiplyPromises).then(function () {
                        $scope.uploaded = true;
                        getVideos();
                    });
                });
            //
            } else {
                // goBackAndNotice();
            }
        };

        $scope.uploadTutorVideo = function (file, tutorVideo) {


            $scope.loader = Upload.http({
                url: $scope.ticket.upload_link_secure,
                headers: {
                    'Content-Type': file.type
                },
                method: 'PUT',
                data: file
            }).then(function (resp) {
                var data = {
                    complete_uri: $scope.ticket.complete_uri,
                    title: tutorVideo.title,
                    description: tutorVideo.description,
                    active: tutorVideo.active
                };

                return $http.post(ENDPOINT_URI + 'videos/applyTutorHelpVideo', data).then(function (response) {
                    $scope.uploaded = true;
                    getTutorHelpVideo();
                });
            }, function (resp) {
                console.log('Error status: ' + resp);
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        $scope.openEditVideoDialog = function (video) {
            $scope.newVideo = angular.copy(video);
            $scope.newVideo.subject = {};
            angular.forEach($scope.subjects, function (item) {
                if (item.id == $scope.newVideo.subject_id) {
                    $scope.selectedSubject.value = item;
                }
            });
            $scope.uploaded = false;
            $scope.edited = true;
            ngDialog.open({
                template: '/templates/admin/dialogs/video-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.openEditTutorVideoDialog = function (video) {
            $scope.newVideo = angular.copy(video);

            $scope.uploaded = false;
            $scope.edited = true;
            ngDialog.open({
                template: '/templates/admin/dialogs/tutor-help-video-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.updateVideo = function (video, dialog) {
            video.subject_id = $scope.selectedSubject.value.id;
            $http.put(ENDPOINT_URI + 'videos/' + video.id, video).then(function (response) {
                getVideos();
            });
            dialog.closeThisDialog(0);
        };

        $scope.updateTutorVideo = function (tutorVideo, dialog) {
            $http.put(ENDPOINT_URI + 'videos/updateTutorVideo/' + tutorVideo.id, tutorVideo).then(function (response) {
                getTutorHelpVideo();
            });
            dialog.closeThisDialog(0);
        };

        $scope.filterVideo = function (subject) {
            if (subject) {
                $scope.freeVideos = [];
                $scope.payedVideos = [];
                angular.forEach($scope.videos, function (item) {
                    if (item.subject_id == subject.id) {
                        if (item.free == 1) {
                            $scope.freeVideos.push(item);
                        } else {
                            $scope.payedVideos.push(item);
                        }
                    }
                });
            } else {
                getVideos();
            }
        };
        $scope.openDeleteVideoDialog = function (video) {
            $scope.deletedVideo = video;
            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/delete-video.tpl.html',
                scope: $scope
            }).then(function (video) {
                $http.delete(ENDPOINT_URI + 'videos/' + video.id).then(function () {
                    getVideos();
                });
            });
        };

        $scope.openDeleteTutorVideoDialog = function (tutorVideo) {
            $scope.deletedVideo = tutorVideo.video;
            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/delete-video.tpl.html',
                scope: $scope
            }).then(function (video) {
                $http.delete(ENDPOINT_URI + 'videos/deleteTutorVideo/' + video.id).then(function () {
                    getTutorHelpVideo();
                });
            });
        };

        $scope.getVideoSubject = function (video) {
            var subject;
            angular.forEach($scope.subjects, function (item) {
                if (video.subject_id == item.id) {
                    subject = item.name;
                }
            });
            return subject;
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
        $scope.tutorsVideos = [];
        $scope.edited = false;
        $scope.selectedSubject = {};
        $scope.video_actions = false;
        $scope.payedVideos = [];
        $scope.freeVideos = [];
        $scope.newVideo = {};
        $scope.videos = [];
        $scope.videoFilter = {};
        $scope.ticket = {};
        $scope.deletedVideo = {};
        $scope.showingVideo = {};
    }
]);