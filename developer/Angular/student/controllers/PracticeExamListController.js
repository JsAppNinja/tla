/**
 * Created by supostat on 16.11.15.
 */


app.controller('PracticeExamListController',
    ['$scope', 'QuizzesModel', '$http', 'ExamsModel', 'SubjectsModel', 'TopicsModel', 'SubtopicsModel', 'ENDPOINT_URI', '$sce', 'ngDialog',
        function ($scope, QuizzesModel, $http, ExamsModel, SubjectsModel, TopicsModel, SubtopicsModel, ENDPOINT_URI, $sce, ngDialog) {

            ExamsModel.all().then(function (result) {
                $scope.selectedExamType = result.data.data[0];
                $scope.exam_types = result.data.data;
            });

            $scope.$watch('selectedExamType', function (selectedExamType) {
                SubjectsModel.all(selectedExamType.id).then(function (result) {
                    if (result.data.length) {
                        $scope.selectedSubject = result.data[0];
                        $scope.subjects = result.data;
                    } else {
                        $scope.exams = [];
                        $scope.subjects = [];
                        $scope.selectedSubject = {};
                    }
                })
            });

            $scope.onVideoSubjectSelect = function (selectedSubject) {
                if(selectedSubject) {
                    $http.get(ENDPOINT_URI + 'videos/getVideos', {params:{subject_id: selectedSubject.id}}).then(function (response) {
                        $scope.videos = response.data;
                    });
                } else {
                    getVideos();
                }
            };

            $scope.$watch('selectedSubject', function (selectedSubject) {
                QuizzesModel.all(selectedSubject.id).then(function (result) {
                    $scope.exams = result.data;
                });
                refreshTopics();
            });

            var csrfToken = $('meta[name="csrf-token"]').attr("content");

            $scope.stopPractice = function (index) {
                if (index.practice) {
                    var data = {
                        quizpractice_id: index.practice.id,
                        _csrf: csrfToken,
                        from_list: 1
                    };
                    $http.post('/student/finish-practice', data).then(function (result) {
                        index.practice = false;
                        index.viewed['viewed'] = false;
                    })
                }
            };

            $scope.getLength = function (length) {
                return humanizeDuration(length, {delimiter: ", "});
            };

            $scope.$watch('selectedFilterType', function (selectedFilterType) {
                refreshTopics();
            });
            $scope.$watch('selectedTopic', function (selectedTopic) {
                if (selectedTopic) {
                    SubtopicsModel.all(selectedTopic.id).then(function (result) {
                        $scope.subtopics = result.data;
                    });
                } else {
                    $scope.subtopics = null;
                }
            });
            var refreshTopics = function () {
                if ($scope.selectedFilterType.name == 'Modified') {
                    TopicsModel.all($scope.selectedSubject.id).then(function (result) {
                        $scope.topics = result.data;
                    });
                } else {
                    $scope.selectedTopic = null;
                    $scope.selectedSubTopic = null;
                    $scope.selectedQuestionNumber = null;
                    $scope.timer = true;
                }
            };

            $scope.filterTypes = [
                {
                    name: "Standard"
                },
                {
                    name: "Modified"
                }
            ];

            function videosSubjects() {
                $http.get(ENDPOINT_URI + 'subjects/getVideosSubjects').then(function (response) {
                    $scope.videosSubjects = response.data;
                });
            }

            function getVideos() {
                $http.get(ENDPOINT_URI + 'videos/getVideos').then(function (response) {
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

            videosSubjects();
            getVideos();

            $scope.questionNumber = ['5', '10', '15', '20'];
            $scope.selectedQuestionNumber = '';

            $scope.exams = [];
            $scope.viewingVideo = {};

            $scope.selectedFilterType = $scope.filterTypes[0];
            $scope.selectedExamType = {};
            $scope.selectedSubject = {};
            $scope.selectedTopic = {};
            $scope.selectedSubTopic = {};
            $scope.selectedVideosSubject = {};
            $scope.videos = [];
            $scope.videosSubjects = [];

            $scope.exam_types = [];
            $scope.subjects = [];
            $scope.topics = [];
            $scope.subtopics = [];

            $scope.timer = true;
        }]);