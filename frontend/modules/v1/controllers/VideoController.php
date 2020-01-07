<?php
namespace frontend\modules\v1\controllers;

use common\models\Video;
use frontend\modules\v1\models\AdminVideo;
use frontend\modules\v1\models\TutorHelpVideo;
use frontend\modules\v1\models\User;
use Vimeo\Vimeo;
use Yii;
use yii\rest\ActiveController;

class VideoController extends ActiveController
{
    private $user;
    public $modelClass = 'frontend\modules\v1\models\User';

    public function init()
    {
        parent::init();
        $this->user = Yii::$app->user->identity;
        if (isset($this->user)) {
            if ($this->user->isAdmin()) {
                $this->modelClass = 'frontend\modules\v1\models\AdminVideo';
            }
            if ($this->user->isTeacher()) {
                $this->modelClass = 'frontend\modules\v1\models\AdminVideo';
            }
        }
    }

    public function verbs()
    {
        $verbs = [
            'create-ticket' => ['GET'],
            'apply-video' => ['POST'],
            'save-state' => ['PUT'],
            'get-free-videos' => ['GET'],
            'get-videos' => ['GET'],
            'get-tutor-help-video' => ['GET'],
            'apply-tutor-help-video' => ['POST'],
            'update-tutor-video' => ['PUT'],
            'delete-tutor-video' => ['DELETE'],
            'save-order' => ['PUT']
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
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $adminVideos = AdminVideo::find()->orderBy('sort')->all();
        foreach ($adminVideos as $video) {
            if ($video->status != AdminVideo::VIDEO_AVAILABLE) {
                $response = $lib->request($video->video_url, array(), 'GET');
                $video->iframe = $response['body']['embed']['html'];
                switch ($response['body']['status']) {
                    case 'available': {
                        $video->status = AdminVideo::VIDEO_AVAILABLE;
                        $video->preview_img = $response['body']['pictures']['sizes'][1]['link'];
                        break;
                    }
                    case 'transcoding': {
                        $video->status = AdminVideo::VIDEO_TRANSCODING;
                        break;
                    }
                    default: {
                        $video->status = AdminVideo::VIDEO_ERROR;
                        break;
                    }
                }
                $video->save();
            }
        }
        return $adminVideos;
    }

    public function actionCreateTicket()
    {
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $response = $lib->request('/me/videos', ['type' => 'streaming'], 'POST');
        $result['upload_link_secure'] = $response['body']['upload_link_secure'];
        $result['complete_uri'] = $response['body']['complete_uri'];
        return $result;
    }

    public function actionApplyVideo()
    {
        $request = Yii::$app->request->getBodyParams();
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $response = $lib->request($request['complete_uri'], [], 'DELETE');

        $admin = User::findOne(['id' => $this->user->id]);
        $video = new AdminVideo();
        $video->user_id = $admin->id;
        $video->video_url = $response['headers']['Location'];
        $video->subject_id = $request['subject_id'];
        $video->title = $request['title'];
        $video->description = $request['description'];
        $video->free = $request['free'];
        if (isset($request['active'])) {
            $video->active = $request['active'];
        }
        return $video->save();
    }

    public function actionApplyTutorHelpVideo()
    {
        $request = Yii::$app->request->getBodyParams();
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        $response = $lib->request($request['complete_uri'], [], 'DELETE');

        $video = new Video();
        $video->video_url = $response['headers']['Location'];
        $video->save();

        $tutorVideo = new TutorHelpVideo();
        $tutorVideo->video_id = $video->id;
        $tutorVideo->title = $request['title'];
        $tutorVideo->description = $request['description'];
        if(isset($request['active'])) {
            $tutorVideo->active = $request['active'];
        } else {
            $tutorVideo->active = 0;
        }
        $tutorVideo->save();

        return $tutorVideo;
    }

    public function actionUpdate($id)
    {
        $request = Yii::$app->request->getBodyParams();

        $adminVideo = AdminVideo::findOne($id);
        $adminVideo->load($request, '');
        return $adminVideo->update();
    }

    public function actionUpdateTutorVideo($id)
    {
        $request = Yii::$app->request->getBodyParams();

        $video = TutorHelpVideo::findOne($id);
        $video->load($request, '');
        return $video->update();
    }

    public function actionDelete($id)
    {
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');

        $admin_video = AdminVideo::findOne($id);
        $response = $lib->request($admin_video->video_url, [], 'DELETE');
        if ($response['body'] == null) {
            return $admin_video->delete();
        }
        return $response;
    }

    public function actionDeleteTutorVideo($id)
    {
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');

        $video = Video::findOne($id);
        $response = $lib->request($video->video_url, [], 'DELETE');
        if ($response['body'] == null) {
            return $video->delete();
        }
        return $response;
    }

    public function actionSaveState()
    {
        $request = Yii::$app->request->getBodyParams();
        $adminVideo = AdminVideo::findOne($request['id']);
        $adminVideo->load($request, '');
        return $adminVideo->update(false, ['free']);
    }

    public function actionGetFreeVideos()
    {
        $subject_id = Yii::$app->request->getQueryParam('subject_id');
        $videosQuery = AdminVideo::find()->where(['free' => AdminVideo::FREE_VIDEO, 'active' => 1]);

        if ($subject_id) {
            $videosQuery->andWhere(['subject_id' => $subject_id]);
        }

        return $videosQuery->orderBy('sort')->all();
    }

    public function actionGetVideos()
    {
        $subject_id = Yii::$app->request->getQueryParam('subject_id');
        $videosQuery = AdminVideo::find()->where(['active' => 1]);

        if ($subject_id) {
            $videosQuery->andWhere(['subject_id' => $subject_id]);
        }

        return $videosQuery->orderBy('sort')->all();
    }

    public function actionGetTutorHelpVideo()
    {
        $client_id = '472cef34b3706e9f92feb8cd27f34527cd855c34';
        $client_secret = 'i6A/AbdiqU0xfqsgZ4fJpnJegTll3QZ11cPMZioNg7mrUHEZWnP4xIcmbqc5q/QNeZrj9dfQDMUXbm1+yBxbXOvA89Owuyn2RC02JNf335RCoBTDycDyT/p3qNc5XxxA';
        $lib = new Vimeo($client_id, $client_secret);
        $lib->setToken('51166e9eca16bfd5515a800e8450e42d');
        if($this->user->isAdmin()) {
            $videos = TutorHelpVideo::find()->orderBy('sort')->all();
        } else {
            $videos = TutorHelpVideo::find()->where(['active' => 1])->orderBy('sort')->all();
        }

        foreach ($videos as $tutorVideo) {
            if ($tutorVideo->video->status != Video::VIDEO_AVAILABLE) {
                $response = $lib->request($tutorVideo->video->video_url, array(), 'GET');
                $tutorVideo->video->iframe = $response['body']['embed']['html'];
                switch ($response['body']['status']) {
                    case 'available': {
                        $tutorVideo->video->status = Video::VIDEO_AVAILABLE;
                        $tutorVideo->video->preview_img = $response['body']['pictures']['sizes'][1]['link'];
                        break;
                    }
                    case 'transcoding': {
                        $tutorVideo->video->status = Video::VIDEO_TRANSCODING;
                        break;
                    }
                    default: {
                        $tutorVideo->video->status = Video::VIDEO_ERROR;
                        break;
                    }
                }
                $tutorVideo->video->save();
            }
        }
        return $videos;
    }

    public function actionSaveOrder() {
        $request = Yii::$app->request->getBodyParams();
        foreach ($request['videos'] as $id => $video) {
            if($request['type'] === 'free') {
                $item = AdminVideo::find()->where(['id' => $video['id'], 'free' => 1])->one();
            } elseif ($request['type'] === 'payed') {
                $item = AdminVideo::find()->where(['id' => $video['id'], 'free' => 0])->one();
            } elseif ($request['type'] === 'tutor') {
                $item = TutorHelpVideo::find()->where(['id' => $video['id']])->one();
            }
            $item->sort = $video['order'];
            $item->save();
        }

        return true;
    }
}