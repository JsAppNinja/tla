<?php
$params = array_merge(
    require(__DIR__ . '/../../common/config/params.php'),
    require(__DIR__ . '/../../common/config/params-local.php'),
    require(__DIR__ . '/params.php'),
    require(__DIR__ . '/params-local.php')
);

return [
    'id' => 'app-frontend',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'controllerNamespace' => 'frontend\controllers',
    'modules' => [
        'v1' => [
            'class' => 'frontend\modules\v1\Module',
        ],
    ],
    'components' => [
        'userCounter' => [
            'class' => 'app\components\UserCounter',

            // You can setup these options:
            'tableUsers' => 'pcounter_users',
            'tableSave' => 'pcounter_save',
            'autoInstallTables' => true,
            'onlineTime' => 10, // min
        ],
        'user' => [
            'identityClass' => 'common\models\User',
            'loginUrl' => ['site/index'],
            'enableAutoLogin' => true,
            'on afterLogin' => ['common\models\User', 'afterLogin'],
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],

        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => false,
            'rules' => [
                'signup' => 'site/signup',
                'logout' => 'site/logout',
                'exams' => 'site/exams',
                'about' => 'site/about',
                'testimonials' => 'site/testimonials',
                'contact' => 'site/contact',
                'disclosure' => 'site/disclosure',
                'terms' => 'site/terms',
                'buy' => 'subscription/buy',
                'cancel' => 'subscription/cancel',
                'success' => 'subscription/success',
                'pay/<user_hash>' => 'subscription/pay',


                'tutor/success' => 'tutor-subscription/success',
                'tutor/cancel' => 'tutor-subscription/cancel',
                'tutor/pending' => 'tutor-subscription/pending',

                '/' => 'site/index',
                '/manage' => 'manage/index',
                '/student/search/<id:\d+>' => '/student/view-tutor-profile',
                'request-password-reset' => 'site/request-password-reset',
                'reset-password' => 'site/reset-password',
                'freepractice/practice/<id:\d+>' => 'freepractice/practice',
                'student/dashboard' => 'student/dashboard',
                'student/dashboard/<id:\d+>' => 'student/tutor',
                'student/chat/<id:\d+>' => 'student/tutor-chat',
                'tutor/result/<id:\d+>' => 'tutor/student-result',


                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/assignment'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/assignment'], 'extraPatterns' => ['POST addFile' => 'add-file']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/assignment'], 'extraPatterns' => ['GET getAssignments' => 'get-assignments']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/assignment'], 'extraPatterns' => ['DELETE deleteFile' => 'delete-file']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/assignment'], 'extraPatterns' => ['GET getAssignmentData/{id}' => 'get-assignment-data']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/assignment'], 'extraPatterns' => ['GET getComment/{id}' => 'get-comment']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/assignment'], 'extraPatterns' => ['POST addStudentAssignment' => 'add-student-assignment']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/assignment'], 'extraPatterns' => ['POST addComment' => 'add-comment']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/cms', 'pluralize' => false],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/cms'], 'pluralize' => false, 'extraPatterns' => ['GET getPages' => 'get-pages']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/cms'], 'pluralize' => false, 'extraPatterns' => ['GET getContent/{id}' => 'get-content']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/cms'], 'pluralize' => false, 'extraPatterns' => ['POST saveContent' => 'save-content']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/chat', 'pluralize' => false],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['GET getMessages/{id}' => 'get-messages']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['POST sendMessage' => 'send-message']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['GET getStudents' => 'get-students']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['GET getTutors' => 'get-tutors']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['GET getUnreaded' => 'get-unreaded']],


                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['GET getChats' => 'get-chats']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['GET checkMessages/{id}' => 'check-messages']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['POST createChat' => 'create-chat']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['POST removeChat' => 'remove-chat']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/chat'], 'pluralize' => false, 'extraPatterns' => ['GET getLastMessages' => 'get-last-messages']],


                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/note'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/note'], 'extraPatterns' => ['GET getLessonNotes/{id}' => 'get-lesson-notes']],


                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/hooks'], 'extraPatterns' => ['POST hooks' => 'hooks']],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/lesson'],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/tutor'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getProfileInfo' => 'get-profile-info']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getSubjects' => 'get-subjects']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['PUT saveSubjects' => 'save-subjects']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getStudentsRequests' => 'get-students-requests']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getStudents' => 'get-students']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST acceptStudent' => 'accept-student']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST rejectStudent' => 'reject-student']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST dismissStudent' => 'dismiss-student']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST updateAvatar' => 'update-avatar']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET loadVideo' => 'load-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST testVideo' => 'test-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getVideos' => 'get-videos']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['PUT updateVideo' => 'update-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['DELETE deleteVideo/{id}' => 'delete-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST addSampleVideo' => 'add-sample-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getSampleVideo' => 'get-sample-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['DELETE removeSampleVideo' => 'remove-sample-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['PUT setGradeAccess/{id}' => 'set-subject-access']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getGradeStudents/{id}' => 'get-subject-students']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getGradeLevels' => 'get-grade-levels']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST saveSchedule' => 'save-schedule']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getSchedule/{id}' => 'get-schedule']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getAnnounce' => 'get-announce']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST setAnnounce' => 'set-announce']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getSubjectsPrice' => 'get-subjects-price']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST saveSubjectsPrices' => 'save-subjects-prices']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getMinMaxSubjectPrice/{id}' => 'get-min-max-subject-price']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET getStudentsResults' => 'get-students-results']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['GET viewStudentResult/{id}' => 'view-student-result']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/tutor'], 'extraPatterns' => ['POST addResultComment/{id}' => 'add-result-comment']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/student'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['POST sendRequest' => 'send-request']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['GET getGradeLevels/{id}' => 'get-grade-levels']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['GET getSubjects' => 'get-subjects']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['GET getLessons' => 'get-lessons']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['GET getLesson/{id}' => 'get-lesson']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['GET getProfileData' => 'get-profile-data']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['POST updateAvatar' => 'update-avatar']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['POST saveProfile' => 'save-profile']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['POST changePassword' => 'change-password']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/student'], 'extraPatterns' => ['POST uploadAssignment' => 'upload-assignment']],

                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['POST saveOrder' => 'save-order']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/mmcountry', 'pluralize' => false],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/mmcountry', 'pluralize' => false, 'extraPatterns' => ['GET getCountryPrice/{id}' => 'get-country-price']],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/mmcountry', 'pluralize' => false, 'extraPatterns' => ['GET getMMCountries/{id}' => 'get-mm-countries']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/subscription'],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/systemsettings'],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/subscriptionplan'],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/subscriptionplan', 'extraPatterns' => ['GET getPrice/{id}' => 'get-price']],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/user'],
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/examtype'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/examtype'], 'extraPatterns' => ['POST checkfree/{id}' => 'checkfree']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/examtype'], 'extraPatterns' => ['GET allfree' => 'allfree']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/examtype'], 'extraPatterns' => ['PUT changeState/{id}' => 'change-state']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/examtype'], 'extraPatterns' => ['POST saveOrder' => 'save-order']],

                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/user'], 'extraPatterns' => ['GET getpermission' => 'getpermission']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/user'], 'extraPatterns' => ['POST changePassword' => 'change-password']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/user'], 'extraPatterns' => ['GET getAdmins' => 'get-admins']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/user'], 'extraPatterns' => ['POST createAdmin' => 'create-admin']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/user'], 'extraPatterns' => ['DELETE deleteAdmin/{id}' => 'delete-admin']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/user'], 'extraPatterns' => ['DELETE delete/{id}' => 'delete']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/user'], 'extraPatterns' => ['POST restore/{id}' => 'restore']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/video'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['GET getTicket' => 'create-ticket']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['POST applyVideo' => 'apply-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['PUT saveState' => 'save-state']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['GET getFreeVideos' => 'get-free-videos']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['GET getVideos' => 'get-videos']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['GET getTutorHelpVideo' => 'get-tutor-help-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['POST applyTutorHelpVideo' => 'apply-tutor-help-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['PUT updateTutorVideo/{id}' => 'update-tutor-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['DELETE deleteTutorVideo/{id}' => 'delete-tutor-video']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/video'], 'extraPatterns' => ['PUT saveOrder' => 'save-order']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/quize'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['PUT update/{id}' => 'update']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['DELETE delete/{id}' => 'delete']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['POST create' => 'create']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['GET all' => 'all']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['GET list' => 'list']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['POST saveOrder' => 'save-order']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['GET getTutorsQuizzes' => 'get-tutors-quizzes']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quize'], 'extraPatterns' => ['GET previewQuiz/{id}' => 'preview-quiz']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/answer'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/answer'], 'extraPatterns' => ['POST update/{id}' => 'update']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/answer'], 'extraPatterns' => ['DELETE delete/{id}' => 'delete']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/answer'], 'extraPatterns' => ['POST create' => 'create']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/answer'], 'extraPatterns' => ['GET all' => 'all']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/answer'], 'extraPatterns' => ['GET list/{id}' => 'list']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/section'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/section'], 'extraPatterns' => ['GET list/{id}' => 'list']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/question'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/question'], 'extraPatterns' => ['POST update/{id}' => 'update']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/question'], 'extraPatterns' => ['DELETE delete/{id}' => 'delete']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/question'], 'extraPatterns' => ['POST create' => 'create']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/question'], 'extraPatterns' => ['GET list' => 'list']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/question'], 'extraPatterns' => ['GET all' => 'all']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/question'], 'extraPatterns' => ['POST import' => 'import']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/question'], 'extraPatterns' => ['GET images' => 'images']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/subject'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['POST remove/{id}' => 'remove']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['POST add' => 'add']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['GET list' => 'list']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['GET all' => 'all']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['GET getSubjectsList' => 'get-subjects-list']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['GET getTutorsSubjects' => 'get-tutors-subjects']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['GET getTutorSubjectList/{id}' => 'get-tutor-subject-list']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['GET getFreeVideosSubjects' => 'get-free-videos-subjects']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['GET getVideosSubjects' => 'get-videos-subjects']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/subject'], 'extraPatterns' => ['POST saveOrder' => 'save-order']],

                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/quizpractice'],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quizpractice'], 'extraPatterns' => ['GET viewall/{id}' => 'viewall']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quizpractice'], 'extraPatterns' => ['POST selectanswer' => 'selectanswer']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quizpractice'], 'extraPatterns' => ['POST essaychange' => 'essaychange']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quizpractice'], 'extraPatterns' => ['POST getquestions' => 'getquestions']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/quizpractice'], 'extraPatterns' => ['GET getFinishedQuizzes' => 'get-finished']],
            ],
        ],
        'request' => [
            'cookieValidationKey' => 'a',
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ]
        ],
        'assetManager' => [
            'bundles' => [
                'yii\web\JqueryAsset' => [
                    'js' => [
                        'jquery.min.js',
                    ]
                ],
                'yii\bootstrap\BootstrapPluginAsset' => [
                    'css' => [
                        'css/bootstrap.min.css',
                    ],
                    'js' => [
                        'js/bootstrap.min.js',
                    ],
                ]
            ],
        ],

    ],

    'params' => $params,
];
