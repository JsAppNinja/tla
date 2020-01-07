<?php

namespace frontend\controllers;

use common\models\Quize;
use common\models\Subject;
use frontend\modules\v1\models\Question;
use Yii;
use yii\filters\AccessControl;
use common\models\Examtype;
use yii\helpers\VarDumper;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use common\models\User;


class ManageController extends \yii\web\Controller
{
    public $layout = 'manage';
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['index'],
                'rules' => [
                    [
                        'actions' => ['index'],
                        'allow' => true,
                        'roles' => ['teacher', 'admin', 'superadmin'],
                    ],
                ],
            ],
        ];
    }


    public function actionIndex()
    {

//        $lib = new Vimeo('d6e9e3e1e824fd7e92451d5926be9acbf63c5224', 'crTDDcg26dD3aLf2PqYYBqzUDNTFgL3DNFdl57QcOa4j8WSpLdnAT6bhCVlA2CC94hutdJvC5pVSpUSTePQVj8zUJVzU3DYR7rilaXLYTmsaJs2paQanPF2RXuchFHBn');
//        $lib->setToken('1cda169f4c9b2649cf3d784faaff8525');
//        $response = $lib->request('/videos/159174153', array('per_page' => 2), 'GET');
        $title = '';
//        $video = $response['body']['embed'];
        if (User::isTeacher()) {
            $title = 'Grade level';
        };

        $admin = true;

        if (User::isAdmin()) {
            $title = 'Exam type';
        };

        if(User::isPureAdmin()) {
            $admin = false;
        }

        $this->view->params['admin'] = $admin;
        
        return $this->render('index', compact('title', 'admin'));
    }
}
