<?php
namespace frontend\modules\v1\controllers;

use common\models\Examtype;
use frontend\components\Helpers\MixPanelHelper;
use frontend\modules\v1\models\Lesson;
use Yii;
use yii\rest\ActiveController;
use yii\web\NotFoundHttpException;
use yii\web\ServerErrorHttpException;

class LessonController extends ActiveController
{
    public $modelClass = 'frontend\modules\v1\models\Lesson';

    public $user;

    public function init()
    {
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'save-order' => ['POST'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['create'], $actions['index'], $actions['update'], $actions['delete'], $actions['view']);
        return $actions;
    }

    public function actionIndex($level_id, $subject_id)
    {
        if(!Examtype::findOne(['user_id' => $this->user->id, 'id' => $level_id])) {
            throw new NotFoundHttpException('Not found');
        }
        return Lesson::find()->where(['subject_id' => $subject_id])->orderBy('sort')->all();
    }

    public function actionDelete($id)
    {
        if(!Lesson::deleteAll(['id' => $id])) {
            throw new ServerErrorHttpException('Error');
        }
    }

    public function actionCreate()
    {
        $request = Yii::$app->request->getBodyParams();

        $lesson = new Lesson();
        if($lesson->load($request, '') && $lesson->save()) {
            $mp = new MixPanelHelper(Yii::$app->user->identity);
            $mp->track('Create lesson');
            return $lesson;
        } else {
            return $lesson->errors;
        }
    }

    public function actionUpdate()
    {
        $request = Yii::$app->request->getBodyParams();

        return Lesson::updateAll($request, ['id' => $request['id']]);
    }

    public function actionSaveOrder()
    {
        $request = Yii::$app->request->getBodyParams();
        foreach ($request as $id => $lesson) {
            $item = Lesson::findOne($lesson['id']);
            $item->sort = $lesson['order'];
            $item->save();
        }

        return true;
    }

    public function actionView($id)
    {
        return Lesson::findOne(['id' => $id]);
    }
}