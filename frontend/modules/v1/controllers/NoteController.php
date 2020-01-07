<?php
namespace frontend\modules\v1\controllers;

use common\models\Lesson;
use frontend\modules\v1\models\Note;
use frontend\modules\v1\models\User;
use Yii;
use yii\rest\ActiveController;
use yii\web\NotFoundHttpException;
use yii\web\UploadedFile;

class NoteController extends ActiveController
{
    private $user;
    public $modelClass = 'frontend\modules\v1\models\Note';


    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
    }

    public function verbs()
    {
        $verbs = [
            'get-lesson-notes'
        ];
        return array_merge(parent::verbs(), $verbs);
    }


    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['index']);
        return $actions;
    }

    public function actionIndex()
    {

    }


    public function actionCreate()
    {
        $request = Yii::$app->request->getBodyParams();

        $lesson = Lesson::findOne($request['Note']['lesson_id']);
        if ($lesson && $lesson->checkOwner()) {
            $note = new Note();
            $note->load($request['Note'], '');
            $note->file = UploadedFile::getInstance($note, 'file');

            $note->save();

            return $note->errors;
        }
    }

    public function actionDelete($id)
    {
        $note = Note::findOne($id);
        if ($note->delete()) {
            return unlink(Yii::getAlias('@webroot') . $note->file_path . DIRECTORY_SEPARATOR . $note->file_name);
        }
    }

    public function actionUpdate()
    {
        $request = Yii::$app->request->getBodyParams();
        $lesson = Lesson::findOne($request['lesson_id']);

        if ($lesson && $lesson->checkOwner()) {

            $note = Note::findOne($request['id']);
            $note->load($request, '');

            return $note->save();
        }
    }


    public function actionGetLessonNotes($id)
    {
        $lesson = Lesson::findOne($id);
        if ($lesson && $lesson->checkOwner()) {
            return $lesson->notes;
        }

        throw new NotFoundHttpException('Not found');
    }


}