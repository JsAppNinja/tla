<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace frontend\assets;

use yii\web\AssetBundle;

/**
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class AppTutorUnsubscribeAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $css = [
        'css/landing.css',
        'css/site.css'
    ];
    public $js = [
        'js/angular_tutor_unsubscribe.js',
        'js/main.js',

//        'js/app/routes/routes.js',
//
//        'js/app/models/ExamsModel.js',
//        'js/app/models/SubjectsModel.js',
//        'js/app/models/QuizzesModel.js',
//        'js/app/models/QuestionsModel.js',
//        'js/app/models/AnswersModel.js',
//
//        'js/app/services/AnswersService.js',
//
//        'js/app/controllers/ExamType/ExamTypeCtrl.js',
//        'js/app/controllers/Subject/SubjectsCtrl.js',
//        'js/app/controllers/Quiz/QuizzesCtrl.js',
//        'js/app/controllers/Quiz/QuizzesEditCtrl.js',
//        'js/app/controllers/Quiz/QuizzesCreateCtrl.js',
//        'js/app/controllers/Topic/TopicListCtrl.js',
//        'js/app/controllers/SubTopic/SubTopicListCtrl.js',
//        'js/app/controllers/AssignmentsCtrl.js',
//        'js/app/controllers/NotesCtrl.js',
//        'js/app/controllers/Question/QuestionsCtrl.js',
//        'js/app/controllers/Question/QuestionCreateCtrl.js',
//        'js/app/controllers/Question/QuestionsUpdateCtrl.js',
//        'js/app/controllers/Answer/AnswersCtrl.js',
    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapPluginAsset',
    ];
}
