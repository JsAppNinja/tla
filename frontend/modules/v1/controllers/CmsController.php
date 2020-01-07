<?php
namespace frontend\modules\v1\controllers;

use frontend\modules\v1\models\CmsPage;
use frontend\modules\v1\models\CmsPageContent;
use frontend\modules\v1\models\User;
use Yii;
use yii\rest\ActiveController;

class CmsController extends ActiveController
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
            'get-pages' => ['GET'],
            'get-content' => ['GET'],
            'save-content' => ['POST'],
        ];
        return array_merge(parent::verbs(), $verbs);
    }

    public function actionGetPages()
    {
        return CmsPage::find()->all();
    }

    public function actionGetContent($id)
    {
        return CmsPageContent::find()->where(['page_id' => $id])->all();
    }

    public function actionSaveContent() {
        $request = Yii::$app->request->getBodyParams();

        foreach ($request['blocks'] as $block) {
            if(isset($block['content'])) {

                $page_content = CmsPageContent::find()->where(['page_id' => $block['page_id'], 'name' => $block['name']])->one();
                if(!$page_content) {
                    $page_content = new CmsPageContent();
                }
                $page_content->load($block, '');
                $page_content->save();
            }
        }

    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['delete'], $actions['create'], $actions['update'], $actions['index']);
        return $actions;
    }
}