<?php

namespace frontend\modules\v1\models;

use Yii;


class TutorFeedback extends \common\models\TutorFeedback
{
    public function fields()
    {
        return [
            'id',
            'student' => function() {
                return Student::find($this->student->id)->one();
            },
            'text',
            'created_at' => function() {
                return Yii::$app->formatter->asDatetime($this->created_at, "php:d-m-Y H:i:s");
            }
        ];
    }
}