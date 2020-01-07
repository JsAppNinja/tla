<?php

namespace frontend\modules\v1\models;

use common\models\SubjectOrigin;
use Yii;


class AdminVideo extends \common\models\AdminVideo
{
    public function fields()
    {
        return [
            'id',
            'preview_img',
            'status',
            'iframe',
            'title',
            'description',
            'free',
            'active',
            'subject_id',
            'subject' => function() {
                return SubjectOrigin::findOne($this->subject_id);
            }
        ];
    }
}