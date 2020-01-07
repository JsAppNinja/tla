/**
 * Created by supostat on 05.11.15.
 */



app.controller('QuestionsController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsModel', 'SectionsModel', 'ngDialog',
    function ($http, $scope, $stateParams, $state, QuestionsModel, SectionsModel, ngDialog) {

        var quiz_id = $stateParams.quiz_id;
        function getQuestions() {
            QuestionsModel.all(quiz_id).then(function (result) {
                if (result.data == false) {
                    $scope.isEmptyQuestions = true;
                } else {
                    $scope.isEmptyQuestions = false;
                }
                $scope.questions = result.data;
                if(result.data.length <= 10) {
                    $scope.showPagination = false;
                } else {
                    $scope.showPagination = true;
                }
                $scope.filteredQuestions = $scope.questions.slice(0, 10);
            });
        }

        function getSections() {
            SectionsModel.all($stateParams.quiz_id).then(function (result) {
                $scope.sections = result.data;
            })
        }

        function addSection() {
            var section = {
                'quiz_id': $stateParams.quiz_id
            };
            SectionsModel.create(section).then(function (result) {
                $scope.sections.push(result.data);
            });
        }

        function deleteSection(index) {
            $scope.deletedSection = $scope.sections[index];
            var sectionIndex = index;

            ngDialog.openConfirm({
                template: 'templateSection',
                scope: $scope,
                showClose: false
            }).then(function (section_id) {
                SectionsModel.destroy(section_id).then(function () {
                    $scope.sections.splice(sectionIndex, 1);
                })
            });
        }

        function deleteQuestion(question) {
            $scope.deletedQuestion = question;

            ngDialog.openConfirm({
                template: 'templateQuestion',
                scope: $scope,
                showClose: false
            }).then(function (question_id) {
                QuestionsModel.destroy(question_id).then(function (result) {
                    if ($scope.questions == false) {
                        $scope.isEmptyQuestions = true;
                    } else {
                        $scope.isEmptyQuestions = false;
                    }
                    getQuestions();
                })
            });
        }

        function deleteSectionQuestion(question) {
            var sections = $scope.sections;

            $scope.deletedQuestion = question;

            ngDialog.openConfirm({
                template: 'templateQuestion',
                scope: $scope,
                showClose: false
            }).then(function (question_id) {
                QuestionsModel.destroy(question_id).then(function (result) {
                    angular.forEach(sections, function (item, index) {
                        var section_index = index;
                        angular.forEach(item.questions, function (item, index) {
                            if(item.id == question.id) {
                                $scope.sections[section_index].questions.splice(index, 1);
                            }
                        })
                    });
                })
            });
        }

        function updateDescription(section) {
            SectionsModel.update(section.id, section).then(function (result) {
            });
        }

        /**
         * Pagination scope
         */
        $scope.currentPage = 1;
        $scope.maxSize = 5;
        $scope.numPerPage = 10;

        $scope.questions = [];
        $scope.sections = [];
        $scope.sectionQuestions = [];
        $scope.isEmptyQuestions = false;
        $scope.deleteQuestion = deleteQuestion;
        $scope.addSection = addSection;
        $scope.deleteSection = deleteSection;
        $scope.updateDescription = updateDescription;
        $scope.deleteSectionQuestion = deleteSectionQuestion;
        $scope.showPagination = false;

        $scope.deletedQuestion = {};
        $scope.deletedSection = {};

        $scope.$watch('currentPage + numPerPage', function() {
            var begin = (($scope.currentPage - 1) * $scope.numPerPage);
            var end = begin + $scope.numPerPage;
            $scope.filteredQuestions = $scope.questions.slice(begin, end);
        });

        getSections();
        getQuestions();
    }
]);