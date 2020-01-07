<?php
namespace frontend\modules\v1\controllers;

use frontend\modules\v1\models\Admin;
use frontend\modules\v1\models\User;
use Yii;
use yii\base\Exception;
use yii\rest\ActiveController;

class UserController extends ActiveController
{
    private $user;
    public $modelClass = 'frontend\modules\v1\models\User';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'getpermission' => ['GET'],
            'change-password' => ['POST'],
            'create-admin' => ['POST'],
            'get-admins' => ['GET'],
            'delete-admin' => ['DELETE'],
            'delete' => ['DELETE'],
            'restore' => ['POST']
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actionGetpermission()
    {
        return $this->user->isAdmin();
    }

    public function actionIndex()
    {
        $model = User::find()->where(['<>', 'user_type', User::TYPE_ADMIN])->all();

        $response['users'] = $model;
        $response['tutors'] = User::getNumberOfTeachers();
        $response['students'] = User::getNumberOfStudents();
        $response['schools'] = User::getNumberOfSchools();
        $response['deleted'] = User::getNumberOfDeleted();

        return $response;
    }

    public function actionChangePassword()
    {
        $request = Yii::$app->request->getBodyParams();

        return $this->user->changePassword($request);
    }

    public function actionGetAdmins()
    {

        return Admin::find()->where(['user_type' => User::TYPE_PURE_ADMIN])->all();
    }

    public function actionCreateAdmin() {

        $request = Yii::$app->request->getBodyParams();

        if($request['password'] === $request['passwordConf']) {
            $auth = Yii::$app->authManager;

            $user = new Admin();
            $user->email = $request['email'];
            $user->user_type = User::TYPE_PURE_ADMIN;
            $user->setPassword($request['password']);
            if($user->save()) {
                $auth->assign($auth->getRole('superadmin'), $user->id);
                return true;
            }

        }

        throw new Exception('Error');
    }

    public function actionDeleteAdmin($id) {
        return User::findOne($id)->delete();
    }

    public function actionDelete($id) {
        return User::findOne($id)->delete();
    }

    public function actionRestore($id) {
        return User::findOne($id)->restore();
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['index']);
        return $actions;
    }
}