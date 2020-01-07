/**
 * Created by supostat on 16.11.15.
 */


app.controller('FreepracticeListControllerXs', ['$scope', 'QuizzesModel', '$http', 'ExamsModel', 'SubjectsModel', 'ENDPOINT_URI', 'ngDialog', '$sce',
    function ($scope, QuizzesModel, $http, ExamsModel, SubjectsModel, ENDPOINT_URI, ngDialog, $sce) {
        ExamsModel.allfree().then(function (result) {
            $scope.selectedExamType = result.data[0];
            $scope.exam_types = result.data;
        });

        // $scope.$watch('selectedExamType', function (selectedExamType) {
        //     SubjectsModel.all(selectedExamType.id).then(function (result) {
        //         if(result.data.length) {
        //             $scope.selectedSubject = result.data[0];
        //             $scope.subjects = result.data;
        //         }
        //     })
        // });

        $scope.showExam = function (exam) {
            $('.tryOutXs').show();
            angular.forEach($scope.exam_types, function (item) {
                item.active = true;
            });
            exam.active = !exam.active;

            SubjectsModel.all(exam.id).then(function (result) {
                if(result.data.length) {
                    $scope.selectedSubject = result.data[0];
                    $scope.subjects = result.data;
                    $.scrollTo('.tryOutXs', 500, {offset: {top: -110}});
                }
            });
        };

        $scope.$watch('selectedSubject', function (selectedSubject) {
            QuizzesModel.all(selectedSubject.id).then(function (result) {
                $scope.exams = result.data;
            });
        });

        $scope.onVideoSubjectSelect = function (selectedSubject) {
            if(selectedSubject) {
                $http.get(ENDPOINT_URI + 'videos/getFreeVideos', {params:{subject_id: selectedSubject.id}}).then(function (response) {
                    $scope.videos = response.data;
                });
            } else {
                getVideos();
            }
        };

        $scope.getLength = function (length) {
            return humanizeDuration(length, {delimiter: ", "});
        };

        function freeVideosSubjects() {
            $http.get(ENDPOINT_URI + 'subjects/getFreeVideosSubjects').then(function (response) {
                $scope.videosSubjects = response.data;
            });
        }

        function getVideos() {
            $http.get(ENDPOINT_URI + 'videos/getFreeVideos').then(function (response) {
                $scope.videos = response.data;
            });
        }

        $scope.showVideo = function (video) {
            $scope.viewingVideo.HTMLframe = $sce.trustAsHtml(video.iframe);
            console.log($scope.viewingVideo.HTMLframe);

            ngDialog.openConfirm({
                template: '/templates/view-video.tpl.html',
                scope: $scope,
                className: 'ngdialog-theme-default showing-video'

            });
        };


        getVideos();
        freeVideosSubjects();

        $scope.exams = [];
        $scope.viewingVideo = {};
        $scope.selectedExamType = {};
        $scope.selectedSubject = {};
        $scope.selectedVideoSubject = {};
        $scope.selectedTopic = {};
        $scope.selectedSubTopic = {};
        $scope.videosSubjects = [];
        $scope.videos = [];

        $scope.exam_types = [];
        $scope.subjects = [];
        $scope.topics = [];
        $scope.subtopics = [];

        $scope.timer = true;
    }]);