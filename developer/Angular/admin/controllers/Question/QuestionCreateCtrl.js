/**
 * Created by supostat on 02.11.15.
 */

app.controller('QuestionCreateController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'QuestionsModel',
    'AnswersModel', 'SubtopicsModel', 'TopicsModel', 'Upload', '$timeout',
    function ($http, $scope, $stateParams, $state, QuestionsService, QuestionsModel, AnswersModel, SubtopicsModel, TopicsModel, Upload, $timeout) {

        var quiz_id = $stateParams.quiz_id;
        var section_id = $stateParams.section_id;

        function saveQuestion() {
            var data = {
                question: {
                    content: $scope.question.content,
                    topic_id: !$scope.selectedTopic ? '' : $scope.selectedTopic.id,
                    subtopic_id: !$scope.selectedSubTopic ? '' : $scope.selectedSubTopic.id,
                    quize_id: quiz_id,
                    section_id: section_id ? section_id : '',
                    essay: $scope.essay,
                    sample_essay: $scope.question.sample_essay
                },
                files: $scope.files
            };
            QuestionsModel.create(data).then(function (result) {
                var answers = QuestionsService.answers.get();
                angular.forEach(answers, function (value, key) {
                    value.question_id = result.data.id;
                });
                console.log(answers);
                return AnswersModel.create(answers);
            }).then(function (result) {
                $state.go('examIndex.exam.subjectShow.quizzes.question', null, {reload: true});
            })

        }

        var getTopics = function () {
            var subject_id = $stateParams.subject_id;
            TopicsModel.all(subject_id).then(function (result) {
                $scope.topics = result.data;
            });
        };

        $scope.removeImage = function (file) {
            angular.forEach($scope.files, function (value, key) {
                if ($scope.files[key] == file) {
                    $scope.files.splice(key, 1);
                }
            })
        };

        $scope.uploadFiles = function (files) {
            $scope.files = files;
        };

        $scope.question = {};

        $scope.$watch('selectedTopic', function (selectedTopic) {
            if (selectedTopic) {
                SubtopicsModel.all(selectedTopic.id).then(function (result) {
                    $scope.subtopics = result.data;
                });
            }
        });

        $scope.tinymceOptions = {
            //setup: function (ed) {
            //    ed.on('init', function (args) {
            //        $('.mce-edit-area').writemaths({iFrame: true});
            //    });
            //},
            resize: false,
            height: 300,
            plugins: "tiny_mce_wiris",
            toolbar: "tiny_mce_wiris_formulaEditor"
        };

        getTopics();

        $scope.saveQuestion = saveQuestion;
        $scope.selectedTopic = null;
        $scope.selectedSubTopic = null;
        $scope.essay = 0;
    }
]);