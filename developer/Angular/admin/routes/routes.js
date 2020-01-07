/**
 * Created by supostat on 05.11.15.
 */

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        tinyMCE.baseURL = '/js/tinymce-dist';
        tinyMCE.PluginManager.load('equationeditor', '/js/tinymce-dist/plugins/equation/plugin.min.js');
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home-page', {
                url: '/',
                templateUrl: '/templates/admin/home-page.tpl.html',
                //controller: 'HomePageController',
                ncyBreadcrumb: {
                    label: 'Home'
                }
            })
            .state('users', {
                url: '/users',
                templateUrl: '/templates/admin/users-list.tpl.html',
                controller: 'UsersListController',
                ncyBreadcrumb: {
                    label: 'Registered users list'
                }
            })
            .state('admins', {
                url: '/admins',
                templateUrl: '/templates/admin/admins/admins-index.tpl.html',
                controller: 'AdminsController',
                ncyBreadcrumb: {
                    label: 'Admins'
                }
            })
            .state('cms', {
                url: '/cms',
                templateUrl: '/templates/admin/cms/cms-index.tpl.html',
                controller: 'CmsController',
                ncyBreadcrumb: {
                    label: 'Cms'
                }
            })
            .state('cms.edit', {
                url: '/edit/:page_id',
                views: {
                    '@': {
                        templateUrl: '/templates/admin/cms/cms-edit.tpl.html',
                        controller: 'CmsEditController',

                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit: {{page_name}}'
                }
            })
            .state('quiz-preview', {
                url: '/quiz-preview/:quiz_id',
                templateUrl: '/templates/admin/quiz-preview.tpl.html',
                controller: 'QuizPreviewController',
                ncyBreadcrumb: {
                    label: 'Quiz preview'
                }
            })
            .state('videos', {
                url: '/videos',
                templateUrl: '/templates/admin/Video/video-index.tpl.html',
                controller: 'AdminVideoController',
                ncyBreadcrumb: {
                    label: 'Videos'
                }
            })
            .state('system-settings', {
                url: '/system-settings',
                templateUrl: '/templates/admin/system-settings.tpl.html',
                controller: 'SystemSettingsController',
                ncyBreadcrumb: {
                    label: 'System settings'
                }
            })
            .state('profile-settings', {
                url: '/profile-settings',
                templateUrl: '/templates/admin/profile-settings/profile-settings.tpl.html',
                controller: 'ProfileSettingsController',
                ncyBreadcrumb: {
                    label: 'Profile settings'
                }
            })
            .state('system-settings.student-subscriptions-settings', {
                url: '/student-subscriptions',
                views: {
                    'system-settings@system-settings': {
                        templateUrl: '/templates/admin/system-settings/student-subscriptions.tpl.html',
                        controller: 'StudentSubscriptionsSettingsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Student subscriptions settings'
                }
            })
            .state('system-settings.tutor-subscriptions-settings', {
                url: '/tutor-subscriptions',
                views: {
                    'system-settings@system-settings': {
                        templateUrl: '/templates/admin/system-settings/tutor-subscriptions.tpl.html',
                        controller: 'TutorSubscriptionsSettingsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Tutor subscriptions settings'
                }
            })
            .state('system-settings.mobile-money-settings', {
                url: '/mobile-money',
                views: {
                    'system-settings@system-settings': {
                        templateUrl: '/templates/admin/system-settings/mobile-money.tpl.html',
                        controller: 'MobileMoneySettingsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Mobile money settings'
                }
            })
            .state('examIndex', {
                url: '/exam',
                templateUrl: '/templates/exam/exam-index.tpl.html',
                controller: 'ExamTypeController',
                ncyBreadcrumb: {
                    label: 'Exam types'
                }
            })
            .state('examIndex.exam', {
                url: '/:exam_id',
                views: {
                    '@': {
                        templateUrl: '/templates/exam/exam-show.tpl.html',
                        controller: 'ExamTypeEditController'
                    },
                    'subjects@examIndex.exam': {
                        templateUrl: '/templates/subject/subject-list.tpl.html',
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
                        templateUrl: '/templates/subject/subject-show.tpl.html',
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
                        templateUrl: '/templates/topic/topic-list.tpl.html',
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
                        templateUrl: '/templates/subtopic/subtopic-list.tpl.html',
                        controller: 'SubTopicListCtrl'
                    }
                },
                ncyBreadcrumb: {
                    label: 'SubTopics',
                }
            })
            .state('examIndex.exam.subjectShow.video', {
                url: '/video',
                templateUrl: '/templates/video/subject-video-index.tpl.html',
                ncyBreadcrumb: {
                    label: 'Video'
                },
            })
            .state('examIndex.exam.subjectShow.quizzes', {
                url: '/quizzes',
                controller: 'QuizzesController',
                templateUrl: '/templates/quiz/subject-quiz-index.tpl.html',
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
                        templateUrl: '/templates/quiz/subject-quiz-create.tpl.html',
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
                        templateUrl: '/templates/quiz/subject-quiz-edit.tpl.html',
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
                        templateUrl: '/templates/question/subject-quiz-question-index.tpl.html',
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
                        templateUrl: '/templates/question/subject-quiz-question-new.tpl.html',
                        controller: 'QuestionCreateController'
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                    'topic@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/templates/topic/topic-dropdown.tpl.html',
                        controller: 'TopicListController'
                    },
                    'subtopic@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/templates/subtopic/subtopic-dropdown.tpl.html',
                        controller: 'SubTopicDropdownController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.section', {
                url: '/section/:section_id/create',
                views: {
                    '@': {
                        templateUrl: '/templates/question/subject-quiz-question-new.tpl.html',
                        controller: 'QuestionCreateController'
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.section': {
                        templateUrl: '/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                    'topic@examIndex.exam.subjectShow.quizzes.question.section': {
                        templateUrl: '/templates/topic/topic-dropdown.tpl.html',
                        controller: 'TopicListController'
                    },
                    'subtopic@examIndex.exam.subjectShow.quizzes.question.section': {
                        templateUrl: '/templates/subtopic/subtopic-dropdown.tpl.html',
                        controller: 'SubTopicDropdownController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New in section'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.sectionedit', {
                url: '/section/:section_id/edit/:question_id',
                views: {
                    '@': {
                        templateUrl: '/templates/question/subject-quiz-question-edit.tpl.html',
                        controller: 'QuestionsUpdateController',
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.sectionedit': {
                        templateUrl: '/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.edit', {
                url: '/edit/:question_id',
                views: {
                    '@': {
                        templateUrl: '/templates/question/subject-quiz-question-edit.tpl.html',
                        controller: 'QuestionsUpdateController',
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.edit': {
                        templateUrl: '/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            });
    }]);