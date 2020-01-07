/**
 * Created by supostat on 02.11.15.
 */

app.controller('QuestionsUpdateController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService',
    'QuestionsModel', 'AnswersModel', 'SubtopicsModel', 'TopicsModel', 'Lightbox', 'Upload', '$timeout',
    function ($http, $scope, $stateParams, $state, QuestionsService, QuestionsModel, AnswersModel, SubtopicsModel, TopicsModel, Lightbox, Upload, $timeout) {

        var question_id = $stateParams.question_id;

        function getQuestion() {
            QuestionsModel.fetch(question_id).then(function (result) {
                $scope.question = result.data;
                $('.mce-edit-area').writemaths({iFrame: true});
                getTopics();
            });
        }

        function updateQuestion(question) {
            question.topic_id = $scope.selectedTopic.id;
            question.subtopic_id = $scope.selectedSubTopic.id;

            var data = {
                question: question,
                newImages: $scope.newImages,
                oldImages: $scope.images
            };

            QuestionsModel.update(question.id, data).then(function (result) {
            }).then(function (result) {
                return AnswersModel.update(question_id, QuestionsService.answers.get());
            }).then(function (result) {
                $state.go('examIndex.exam.subjectShow.quizzes.question', null, {reload: true});
            })
        }

        $scope.uploadImages = function (files) {
            if(files) {
                $scope.newImages = $scope.newImages.concat(files);
                console.log($scope.newImages);
            }
        };

        function getQuestionImages() {
            QuestionsModel.images(question_id).then(function (result) {
                $scope.images = result.data;
            })
        }

        var getTopics = function () {
            var subject_id = $stateParams.subject_id;
            TopicsModel.all(subject_id).then(function (result) {
                $scope.topics = result.data;
                angular.forEach($scope.topics, function (value, key) {
                    if (value.id == $scope.question.topic_id) {
                        $scope.selectedTopic = value;
                    }
                });
            });
        };

        $scope.removeImage = function(images, image) {
            angular.forEach(images, function (value, key) {
                if(images[key] == image) {
                    images.splice(key, 1);
                }
            })
        };

        $scope.openLightboxModal = function (index) {
            Lightbox.openModal($scope.images, index);
        };

        $scope.$watch('selectedTopic', function (selectedTopic) {
            console.log(selectedTopic);
            if (selectedTopic) {
                SubtopicsModel.all(selectedTopic.id).then(function (result) {
                    $scope.subtopics = result.data;
                    angular.forEach($scope.subtopics, function (value, key) {
                        if (value.id == $scope.question.subtopic_id) {
                            $scope.selectedSubTopic = value;
                        }
                    });
                });
            } else {
                $scope.subtopics = [];
            }
        });

        $scope.question = {};
        $scope.topics = [];
        $scope.subtopics = [];
        $scope.images = [];
        $scope.newImages = [];
        $scope.updateQuestion = updateQuestion;

        $scope.selectedTopic = {};
        $scope.selectedSubTopic = {};

        $scope.tinymceOptions = {
            resize: false,
            height: 300,
            plugins: 'equationeditor',
            toolbar: "undo redo equationeditor"
        };

        getQuestion();
        getQuestionImages();
    }
]);