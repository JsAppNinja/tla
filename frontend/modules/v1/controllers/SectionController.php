<?php
namespace frontend\modules\v1\controllers;

use frontend\modules\v1\models\Section;
use Yii;
use yii\rest\ActiveController;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;

class SectionController extends ActiveController
{
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['create', 'index', 'delete', 'list'],
                'rules' => [
                    [
                        'actions' => ['create', 'index', 'delete', 'list'],
                        'allow' => true,
                        'roles' => ['teacher', 'admin', 'student', 'superadmin'],
                    ],
                ],
            ],
        ]);
    }

    private $user;
    public $modelClass = 'frontend\modules\v1\models\Section';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['create'], $actions['index'], $actions['delete']);
        return $actions;
    }

    public function actionList($id)
    {
        return Section::find()->where(['quiz_id' => $id])->all();
    }

    public function actionCreate()
    {
        $model = new Section();
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        if($model->save()) {
            return $model;
        }

        return false;
    }

    public function actionDelete($id)
    {
        $model = Section::findOne(['id' => $id]);
        if (!$model) {
            throw new NotFoundHttpException;
        }
        if ($model->delete() === false) {
            throw new HttpException(500, 'Internal Server Error');
        }

        $quiz = $model->quiz;
        $quiz->type = $quiz->checkType();
        $quiz->save();
    }
}