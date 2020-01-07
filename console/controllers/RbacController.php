<?php
namespace console\controllers;

use Yii;
use yii\console\Controller;

class RbacController extends Controller
{
    public function actionInit()
    {
        $auth = Yii::$app->authManager;

        $admin = $auth->createRole('admin');
        $auth->add($admin);
//
        $teacher = $auth->createRole('teacher');
        $auth->add($teacher);

        $student = $auth->createRole('student');
        $auth->add($student);

        $superadmin = $auth->createRole('superadmin');
        $auth->add($superadmin);
    }
}