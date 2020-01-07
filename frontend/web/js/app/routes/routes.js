/**
 * Created by supostat on 05.11.15.
 */

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        tinyMCE.baseURL = '/js/tinymce-dist';
        tinyMCE.PluginManager.load('equationeditor', '/js/tinymce-dist/plugins/equation/plugin.min.js');
        $urlRouterProvider.otherwise('/exam');
        $stateProvider
            .state('examIndex', {
                url: '/exam',
                templateUrl: '/js/app/templates/exam/exam-index.tpl.html',
                controller: 'ExamTypeController',
                ncyBreadcrumb: {
                    label: 'Home'
                }
            })
            .state('examIndex.exam', {
                url: '/:exam_id',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/exam/exam-show.tpl.html',
                        controller: 'ExamTypeEditController'
                    },
                    'subjects@examIndex.exam': {
                        templateUrl: '/js/app/templates/subject/subject-list.tpl.html',
                        controller: 'SubjectsController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Exam: {{ examName }}',
                }
            })
            .state('examIndex.exam.subjectShow', {
                url: '/subject/:subject_id',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/subject/subject-show.tpl.html',
                        controller: function ($scope, $state) {
                            $scope.go = function(route){
                                $state.go(route);
                            };
                            $scope.active = function(route){
                                return $state.includes(route);
                            };
                            $scope.tabs = [
                                { heading: "Video", route:"examIndex.exam.subjectShow.video", active:false },
                                { heading: "Quizzes", route:"examIndex.exam.subjectShow.quizzes", active:true },
                            ];

                            $scope.$on("$stateChangeSuccess", function() {
                                $scope.tabs.forEach(function(tab) {
                                    tab.active = $scope.active(tab.route);
                                });
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Subject',
                    skip: true,
                    includeAbstract: true,
                }
            })
            .state('examIndex.exam.topic', {
                'url': '/subject/:subject_id/topic',
                views: {
                    'topics@examIndex.exam': {
                        templateUrl: '/js/app/templates/topic/topic-list.tpl.html',
                        controller: 'TopicListController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Topics',
                }
            })
            .state('examIndex.exam.topic.subtopic', {
                'url': '/:topic_id/subtopic',
                views: {
                    'subtopics@examIndex.exam': {
                        templateUrl: '/js/app/templates/subtopic/subtopic-list.tpl.html',
                        controller: 'SubTopicListCtrl'
                    }
                },
                ncyBreadcrumb: {
                    label: 'SubTopics',
                }
            })
            .state('examIndex.exam.subjectShow.video', {
                url: '/video',
                templateUrl: '/js/app/templates/video/subject-video-index.tpl.html',
                ncyBreadcrumb: {
                    label: 'Video'
                },
            })
            .state('examIndex.exam.subjectShow.quizzes', {
                url: '/quizzes',
                controller: 'QuizzesController',
                templateUrl: '/js/app/templates/quiz/subject-quiz-index.tpl.html',
                onExit: function ($rootScope) {
                    $rootScope.subjectName = undefined;
                },
                ncyBreadcrumb: {
                    label: '{{ subjectName }}: Quizzes'
                },
            })
            .state('examIndex.exam.subjectShow.quizzes.create', {
                url: '/create',
                views: {
                    '@examIndex.exam.subjectShow': {
                        templateUrl: '/js/app/templates/quiz/subject-quiz-create.tpl.html',
                        controller: 'QuizzesCreateController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.edit', {
                url: '/edit/:quiz_id',
                views: {
                    '@examIndex.exam.subjectShow': {
                        templateUrl: '/js/app/templates/quiz/subject-quiz-edit.tpl.html',
                        controller: 'QuizzesEditController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question', {
                url: '/:quiz_id/question',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/question/subject-quiz-question-index.tpl.html',
                        controller: 'QuestionsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Questions',
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.create', {
                url: '/create',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/question/subject-quiz-question-new.tpl.html',
                        controller: 'QuestionCreateController'
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/js/app/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                    'topic@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/js/app/templates/topic/topic-dropdown.tpl.html',
                        controller: 'TopicListController'
                    },
                    'subtopic@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/js/app/templates/subtopic/subtopic-dropdown.tpl.html',
                        controller: 'SubTopicDropdownController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.edit', {
                url: '/edit/:question_id',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/question/subject-quiz-question-edit.tpl.html',
                        controller: 'QuestionsUpdateController',
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.edit': {
                        templateUrl: '/js/app/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            });
    }]);