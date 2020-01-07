<?php

namespace frontend\modules\v1\models;

use Yii;


class Question extends \common\models\Question
{
    public function fields()
    {
        return [
            'id',
            'content',
            'topic_id',
            'subtopic_id',
            'quize_id',
            'section_id',
//            'quiz' => function() {
//                return $this->quiz;
//            },
            'sample_essay',
            'answers' => function() {
                return $this->answers;
            },
            'images' => function() {
                return $this->images;
            },
            'essay'
        ];
    }
}