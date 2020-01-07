/**
 * Created by supostat on 21.03.16.
 */
'use strict';
app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        tinyMCE.baseURL = '/js/tinymce-dist';
        tinyMCE.PluginManager.load('equationeditor', '/js/tinymce-dist/plugins/equation/plugin.min.js');
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home-page', {
                url: '/',
                templateUrl: '/templates/tutor/home-page.tpl.html',
                controller: 'HomePageController',
                ncyBreadcrumb: {
                    label: 'Home'
                }
            })
            .state('quiz-preview', {
                url: '/quiz-preview/:quiz_id',
                templateUrl: '/templates/tutor/quiz-preview.tpl.html',
                controller: 'QuizPreviewController',
                ncyBreadcrumb: {
                    label: 'Quiz preview'
                }
            })
            .state('schedule-announcement', {
                url: '/schedule-announcement',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/schedule/schedule_announcement-index.tpl.html',
                        controller: function ($scope, $state) {
                            $scope.go = function(route){
                                $state.go(route);
                            };
                            $scope.active = function(route){
                                return $state.includes(route);
                            };

                            $scope.title = 'Schedule and announcement';

                            $scope.tabs = [
                                { heading: "Schedule", route:"schedule-announcement.schedule", active:false },
                                { heading: "Announcement", route:"schedule-announcement.announcement", active:false },
                            ];

                            // $scope.go($scope.tabs[0].route);

                            $scope.$on("$stateChangeSuccess", function() {
                                console.log($state.current.name);
                                if($state.current.name == 'schedule-announcement') {
                                    $scope.go('schedule-announcement.schedule');
                                    return;
                                }
                                $scope.tabs.forEach(function(tab) {
                                    if(tab.active) {
                                        $scope.title = tab.heading;
                                    }
                                    tab.active = $scope.active(tab.route);
                                });
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    includeAbstract: true,
                    label: 'Schedule and announcement'
                }
            })
            .state('schedule-announcement.schedule', {
                url: '/schedule',
                views: {
                    '@schedule-announcement': {
                        templateUrl: '/templates/tutor/schedule/schedule-index.tpl.html',
                        controller: function ($scope, $state, ENDPOINT_URI, $http) {
                            $scope.go = function(model){
                                $scope.crumb = model.heading;
                                $state.go(model.route, model.params);
                            };
                            $scope.active = function(route){
                                return $state.includes(route);
                            };

                            $scope.title = 'Schedule and announcement';
                            $scope.gradeLevelsTab = [];
                            function getGradeLevels() {
                                $http.get(ENDPOINT_URI + 'tutors/getGradeLevels').then(function (response) {
                                    var gradeLevels = response.data;
                                    angular.forEach(gradeLevels, function (item) {
                                        var tab = {
                                            heading: item.name,
                                            route: 'schedule-announcement.schedule.grade',
                                            params: {
                                                schedule_grade_id: item.id
                                            },
                                            active: false
                                        };
                                        $scope.gradeLevelsTab.push(tab);
                                    });
                                    $scope.gradeLevelsTab[0].active = true;
                                    $scope.go($scope.gradeLevelsTab[0]);

                                });
                            }
                            getGradeLevels();



                            $scope.$on("$stateChangeSuccess", function() {
                                if($scope.gradeLevelsTab.length) {
                                    console.log($state.current.name);
                                    if($state.current.name == 'schedule-announcement.schedule') {
                                        $scope.go($scope.gradeLevelsTab[0]);
                                        return;
                                    }
                                }
                            });
                        }
                    }
                },
                // controller: 'ExamTypeController',
                ncyBreadcrumb: {
                    label: 'Schedule'
                }
            })
            .state('schedule-announcement.schedule.grade', {
                url: '/:schedule_grade_id',
                views: {
                    'grade@schedule-announcement.schedule': {
                        templateUrl: '/templates/tutor/schedule/schedule-grade.tpl.html',
                        controller: 'ScheduleController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Grade level: {{crumb}}'
                }
            })
            .state('schedule-announcement.announcement', {
                url: '/announcement',
                views: {
                    '@schedule-announcement': {
                        templateUrl: '/templates/tutor/schedule/announcement-index.tpl.html',
                        controller: 'AnnouncementController'
                    }
                },
                // controller: 'ExamTypeController',
                ncyBreadcrumb: {
                    label: 'Announcement'
                }
            })
            .state('grade-index', {
                url: '/grade-levels',
                controller: 'ExamTypeController',
                templateUrl: '/templates/tutor/grade-levels/grade-index.tpl.html',
                ncyBreadcrumb: {
                    label: 'Grade levels'
                }
            })
            .state('grade-index.grade-access-right', {
                url: '/:grade_id/access-rights',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/grade-levels/grade-access.tpl.html',
                        controller: 'ExamTypeAccessController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Grade access rights'
                }
            })
            .state('chat', {
                url: '/chat',
                controller: 'TutorChatController',
                templateUrl: '/templates/tutor/chat/chat-index.tpl.html',
                ncyBreadcrumb: {
                    label: 'Chat'
                }
            })
            .state('chat.messages', {
                url: '/:chat_id',
                views: {
                    'messages@chat': {
                        controller: 'TutorMessagesController',
                        templateUrl: '/templates/tutor/chat/chat-messages.tpl.html',

                    }
                },
                ncyBreadcrumb: {
                    label: 'Messages'
                }
            })
            .state('students', {
                url: '/students',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/students/students-index.tpl.html',
                        controller: function ($scope, $state) {
                            $scope.go = function(route){
                                $state.go(route);
                            };
                            $scope.active = function(route){
                                return $state.includes(route);
                            };

                            $scope.title = 'Students';

                            $scope.tabs = [
                                { heading: "Students requests", route:"students.requests", active:true },
                                { heading: "My students", route:"students.my", active:false },
                                { heading: "Results", route:"students.results", active:false },
                            ];

                            $scope.go($scope.tabs[0].route);

                            $scope.$on("$stateChangeSuccess", function() {
                                if($state.current.name == 'students') {
                                    $scope.go('students.requests');
                                    return;
                                }
                                $scope.tabs.forEach(function(tab) {
                                    if(tab.active) {
                                        $scope.title = tab.heading;
                                    }
                                    tab.active = $scope.active(tab.route);
                                });
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    includeAbstract: true,
                    label: 'Students'
                }
            })
            .state('students.requests', {
                url: '/requests',
                views: {
                    '@students': {
                        controller: 'StudentsRequestsController',
                        templateUrl: '/templates/tutor/students/students-requests.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Students requests'
                }
            })
            .state('students.my', {
                url: '/my-students',
                views: {
                    '@students': {
                        controller: 'TutorStudentsController',
                        templateUrl: '/templates/tutor/students/students-tutor.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'My students'
                }
            })
            .state('students.results', {
                url: '/results',
                views: {
                    '@students': {
                        controller: 'TutorStudentsResultsController',
                        templateUrl: '/templates/tutor/students/students-tutor-results.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Students results'
                }
            })
            .state('students.results.result', {
                url: '/:id',
                views: {
                    '@students': {
                        controller: 'TutorStudentsResultController',
                        templateUrl: '/templates/tutor/students/students-tutor-result.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Result'
                }
            })
            .state('billing', {
                url: '/billing-cycle',
                //controller: 'ExamTypeController',
                templateUrl: '/templates/tutor/billing/billing-index.tpl.html',
                ncyBreadcrumb: {
                    label: 'Billing cycle'
                }
            })
            .state('profile', {
                url: '/profile',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/profile/profile-index.tpl.html',
                        controller: function ($scope, $state) {
                            $scope.go = function(route){
                                $state.go(route);
                            };
                            $scope.active = function(route){
                                return $state.includes(route);
                            };

                            $scope.title = 'Profile';

                            $scope.tabs = [
                                { heading: "Edit profile", route:"profile.edit-profile", active:true },
                                { heading: "Subjects price", route:"profile.subjects-price", active:false },
                                { heading: "Change password", route:"profile.change-password", active:false },
                                { heading: "Subjects", route:"profile.subjects", active:false },
                            ];

                            $scope.go($scope.tabs[0].route);

                            $scope.$on("$stateChangeSuccess", function() {
                                if($state.current.name == 'profile') {
                                    $scope.go('profile.edit-profile');
                                    return;
                                }
                                $scope.tabs.forEach(function(tab) {
                                    if(tab.active) {
                                        $scope.title = tab.heading;
                                    }
                                    tab.active = $scope.active(tab.route);
                                });
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    includeAbstract: true,
                    label: 'Profile'
                }
            })
            .state('profile.edit-profile', {
                'url': '/edit-profile',
                views: {
                    '@profile': {
                        templateUrl: '/templates/tutor/profile/profile-edit_profile.tpl.html',
                        controller: 'ProfileController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit profile',
                }
            })
            .state('profile.subjects-price', {
                'url': '/subjects-price',
                views: {
                    '@profile': {
                        templateUrl: '/templates/tutor/profile/profile-subjects_price.tpl.html',
                        controller: 'ProfilePricesController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Subjects price',
                }
            })
            .state('profile.change-password', {
                'url': '/change-password',
                views: {
                    '@profile': {
                        templateUrl: '/templates/tutor/profile/profile-change_password.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Change password',
                }
            })
            .state('profile.subjects', {
                'url': '/subjects',
                views: {
                    '@profile': {
                        templateUrl: '/templates/tutor/profile/profile-subjects.tpl.html',
                        controller: 'ProfileSubjectController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Subjects',
                }
            })
            .state('grade-index.level', {
                url: '/:level_id',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/grade-levels/grade-show.tpl.html',
                        controller: 'ExamTypeEditController'
                    },
                    'subjects@grade-index.level': {
                        templateUrl: '/templates/tutor/subject/subject-list.tpl.html',
                        controller: 'SubjectsController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Grade level: {{ gradeLevelName }}',
                }
            })
            .state('grade-index.level.topic', {
                'url': '/subject/:subject_id/topic',
                views: {
                    'topics@grade-index.level': {
                        templateUrl: '/templates/tutor/topic/topic-list.tpl.html',
                        controller: 'TopicListController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Topics',
                }
            })
            .state('grade-index.level.topic.subtopic', {
                'url': '/:topic_id/subtopic',
                views: {
                    'subtopics@grade-index.level': {
                        templateUrl: '/templates/tutor/subtopic/subtopic-list.tpl.html',
                        controller: 'SubTopicListCtrl'
                    }
                },
                ncyBreadcrumb: {
                    label: 'SubTopics',
                }
            })
            .state('grade-index.level.subject', {
                url: '/:subject_id',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/subject/subject-index.tpl.html',
                        controller: function ($scope, $state, $stateParams) {
                            $scope.go = function(route){
                                $state.go(route);
                            };
                            //$scope.active = function(route){
                            //    return $state.includes(route);
                            //};
                            console.log($scope);
                            $scope.title = 'Profile';
                            $scope.subject_id = $stateParams.subject_id;
                            //$scope.tabs = [
                            //    { heading: "Edit profile", route:"", active:false },
                            //    { heading: "Change password", route:"", active:false },
                            //    { heading: "Subjects", route:"", active:false },
                            //];

                            //$scope.go($scope.tabs[0].route);

                            $scope.$on("$stateChangeSuccess", function() {
                                console.log($state.current.name);
                                if($state.current.name == 'grade-index.level.subject') {
                                    $scope.go('grade-index.level.subject.lessons');
                                    return;
                                }
                                //$scope.tabs.forEach(function(tab) {
                                //    if(tab.active) {
                                //        $scope.title = tab.heading;
                                //    }
                                //    tab.active = $scope.active(tab.route);
                                //});
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    // includeAbstract: true,
                    label: 'Subject',
                    parent: 'grade-index.level'
                }
            })
            .state('grade-index.level.subject.lessons', {
                url: '/lessons',
                views: {
                    '@grade-index.level.subject': {
                        templateUrl: '/templates/tutor/lesson/lesson-list.tpl.html',
                        controller: 'LessonController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Lessons',
                }
            })
            .state('grade-index.level.subject.students', {
                url: '/students',
                views: {
                    '@grade-index.level.subject': {
                        templateUrl: '/templates/tutor/grade-levels/grade-access.tpl.html',
                        controller: 'ExamTypeAccessController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Students',
                }
            })
            .state('grade-index.level.subject.lessons.create', {
                url: '/create',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/lesson/lesson-new.tpl.html',
                        controller: 'LessonCreateController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            })
            .state('grade-index.level.subject.lessons.edit', {
                url: '/edit/:lesson_id',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/lesson/lesson-edit.tpl.html',
                        controller: 'LessonEditController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            })
            .state('grade-index.level.subject.lessons.materials', {
                url: '/:lesson_id/materials',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/materials.tpl.html',
                        controller: function ($scope, $state) {
                            $scope.go = function(route){
                                $state.go(route);
                            };
                            $scope.active = function(route){
                                return $state.includes(route);
                            };
                            $scope.tabs = [
                                { heading: "Video", route:"grade-index.level.subject.lessons.materials.video", active:true },
                                { heading: "Test/Exam Questions", route:"grade-index.level.subject.lessons.materials.quizzes", active:false },
                                { heading: "Notes", route:"grade-index.level.subject.lessons.materials.notes", active:false },
                                { heading: "Assignments", route:"grade-index.level.subject.lessons.materials.assignments", active:false },
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
                    skip: true,
                    label: 'Materials'
                },
            })
            .state('grade-index.level.subject.lessons.materials.assignments', {
                url: '/assignments',
                views: {
                    '@grade-index.level.subject.lessons.materials' : {
                        controller: 'AssignmentsController',
                        templateUrl: '/templates/tutor/assignments/assignments-index.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Assignments'
                },
            })
            .state('grade-index.level.subject.lessons.materials.assignments.create', {
                url: '/create',
                views: {
                    '@grade-index.level.subject.lessons.materials' : {
                        controller: 'AssignmentsCreateController',
                        templateUrl: '/templates/tutor/assignments/assignments-new.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'New assignment'
                },
            })
            .state('grade-index.level.subject.lessons.materials.assignments.view', {
                url: '/view/:assignment_id',
                views: {
                    '@grade-index.level.subject.lessons.materials' : {
                        controller: 'AssignmentsViewController',
                        templateUrl: '/templates/tutor/assignments/assignments-view.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'View'
                },
            })
            .state('grade-index.level.subject.lessons.materials.assignments.view.comments', {
                url: '/:student_id',
                views: {
                    'comments@grade-index.level.subject.lessons.materials.assignments.view' : {
                        controller: 'AssignmentsCommentController',
                        templateUrl: '/templates/tutor/assignments/assignments-comment.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'View'
                },
            })
            .state('grade-index.level.subject.lessons.materials.assignments.edit', {
                url: '/:assignment_id',
                views: {
                    '@grade-index.level.subject.lessons.materials' : {
                        controller: 'AssignmentsCreateController',
                        templateUrl: '/templates/tutor/assignments/assignments-new.tpl.html',
                    }
                },
                ncyBreadcrumb: {
                    label: 'New assignment'
                },
            })
            .state('grade-index.level.subject.lessons.materials.quizzes', {
                url: '/quizzes',
                views: {
                    '@grade-index.level.subject.lessons.materials' : {
                        controller: 'QuizzesController',
                        templateUrl: '/templates/tutor/quiz/subject-quiz-index.tpl.html',
                        onExit: function ($rootScope) {
                            $rootScope.subjectName = undefined;
                        },
                    }
                },
                ncyBreadcrumb: {
                    label: '{{ subjectName }}: Quizzes'
                },
            })
            .state('grade-index.level.subject.lessons.materials.quizzes.create', {
                url: '/create',
                views: {
                    '@grade-index.level.subject.lessons.materials': {
                        templateUrl: '/templates/tutor/quiz/subject-quiz-create.tpl.html',
                        controller: 'QuizzesCreateController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            }).state('grade-index.level.subject.lessons.materials.quizzes.edit', {
                url: '/edit/:quiz_id',
                views: {
                    '@grade-index.level.subject.lessons.materials': {
                        templateUrl: '/templates/tutor/quiz/subject-quiz-edit.tpl.html',
                        controller: 'QuizzesEditController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            }).state('grade-index.level.subject.lessons.materials.quizzes.question', {
                url: '/:quiz_id/question',
                views: {
                    '@grade-index.level.subject.lessons.materials': {
                        templateUrl: '/templates/tutor/question/subject-quiz-question-index.tpl.html',
                        controller: 'QuestionsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Questions',
                }
            }).state('grade-index.level.subject.lessons.materials.quizzes.question.create', {
                url: '/create',
                views: {
                    '@grade-index.level.subject.lessons.materials': {
                        templateUrl: '/templates/tutor/question/subject-quiz-question-new.tpl.html',
                        controller: 'QuestionCreateController'
                    },
                    'answers@grade-index.level.subject.lessons.materials.quizzes.question.create': {
                        templateUrl: '/templates/tutor/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                    'topic@grade-index.level.subject.lessons.materials.quizzes.question.create': {
                        templateUrl: '/templates/tutor/topic/topic-dropdown.tpl.html',
                        controller: 'TopicListController'
                    },
                    'subtopic@grade-index.level.subject.lessons.materials.quizzes.question.create': {
                        templateUrl: '/templates/tutor/subtopic/subtopic-dropdown.tpl.html',
                        controller: 'SubTopicDropdownController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            })
            .state('grade-index.level.subject.lessons.materials.quizzes.question.section', {
                url: '/section/:section_id/create',
                views: {
                    '@grade-index.level.subject.lessons.materials': {
                        templateUrl: '/templates/tutor/question/subject-quiz-question-new.tpl.html',
                        controller: 'QuestionCreateController'
                    },
                    'answers@grade-index.level.subject.lessons.materials.quizzes.question.section': {
                        templateUrl: '/templates/tutor/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                    'topic@grade-index.level.subject.lessons.materials.quizzes.question.section': {
                        templateUrl: '/templates/tutor/topic/topic-dropdown.tpl.html',
                        controller: 'TopicListController'
                    },
                    'subtopic@grade-index.level.subject.lessons.materials.quizzes.question.section': {
                        templateUrl: '/templates/tutor/subtopic/subtopic-dropdown.tpl.html',
                        controller: 'SubTopicDropdownController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New in section'
                }
            })
            .state('grade-index.level.subject.lessons.materials.quizzes.question.sectionedit', {
                url: '/section/:section_id/edit/:question_id',
                views: {
                    '@': {
                        templateUrl: '/templates/tutor/question/subject-quiz-question-edit.tpl.html',
                        controller: 'QuestionsUpdateController',
                    },
                    'answers@grade-index.level.subject.lessons.materials.quizzes.question.sectionedit': {
                        templateUrl: '/templates/tutor/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            })
            .state('grade-index.level.subject.lessons.materials.quizzes.question.edit', {
                url: '/edit/:question_id',
                views: {
                    '@grade-index.level.subject.lessons.materials': {
                        templateUrl: '/templates/tutor/question/subject-quiz-question-edit.tpl.html',
                        controller: 'QuestionsUpdateController',
                    },
                    'answers@grade-index.level.subject.lessons.materials.quizzes.question.edit': {
                        templateUrl: '/templates/tutor/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            })
            .state('grade-index.level.subject.lessons.materials.video', {
                url: '/video',
                views: {
                    '@grade-index.level.subject.lessons.materials': {
                        templateUrl: '/templates/tutor/video/subject-video-index.tpl.html',
                        controller: 'TutorVideoController'
                    },
                },
                ncyBreadcrumb: {
                    label: 'Video'
                },
            })
            .state('grade-index.level.subject.lessons.materials.notes', {
                url: '/notes',
                views: {
                    '@grade-index.level.subject.lessons.materials': {
                        templateUrl: '/templates/tutor/note/note-index.tpl.html',
                        controller: 'NotesController'
                    },
                },
                ncyBreadcrumb: {
                    label: 'Notes'
                },
            });
    }]);