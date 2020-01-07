<?php

namespace frontend\modules\v1\models;

use common\models\Student;
use common\models\Subscription;
use common\models\SubscriptionPlan;
use DateTime;
use Yii;


class Tutor extends \common\models\Tutor
{
    public $requested = false;

    public function fields()
    {
        return [
            'id',
            'user_id',
            'first_name',
            'last_name',
            'skype',
            'phone',
            'profile_description',
            'payment_description',
            'sample_video_link',
            'iframe',
            'price_per_subject',
            'price_for_all_subjects',
            'hasChat' => function () {
                foreach (Yii::$app->user->identity->chats as $chat) {
                    if (($chat->type == Chat::CUSTOM) &&
                        ($chat->status == Chat::STATUS_ACTIVE) &&
                        ($chat->opponent->id == $this->user_id)) {
                            return true;
                    }
                }
                return false;
            },
            'subjects' => function () {
                return $this->tutorSubjects;
            },
            'requested' => function () {
                foreach ($this->studentRequests as $request) {
                    if ($request->user_id == Yii::$app->user->identity->id) return true;
                }
                return false;
            },
            'educating' => function () {
                foreach ($this->tutorStudents as $request) {
                    if ($request->user_id == Yii::$app->user->identity->id) return true;
                }
                return false;
            },
            'remaining' => function () {
                $total_count = $this->user->subscription["plan"]["students_count"];
                $current_count = count($this->tutorStudents);
                return $total_count - $current_count <= 0 ? 0 : $total_count - $current_count;
            },
            'avatar' => function () {
                if (!$this->avatar) return false;
                return DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'avatars' . DIRECTORY_SEPARATOR . 'tutors' . DIRECTORY_SEPARATOR . $this->id . DIRECTORY_SEPARATOR . $this->avatar;
            },
            'avatar_original' => function () {
                if (!$this->avatar_original) return false;
                return DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'avatars' . DIRECTORY_SEPARATOR . 'tutors' . DIRECTORY_SEPARATOR . $this->id . DIRECTORY_SEPARATOR . $this->avatar_original;
            },

        ];
    }
}