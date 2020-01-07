<?php

namespace frontend\modules\v1\models;

use common\models\Quize;
use frontend\modules\v1\models\Question;
use Yii;


class Quizpractice extends \common\models\Quizpractice
{
    public function fields()
    {
        return [
            'id',
            'start_practice' => function () {
                return (($this->quiz->hours * 60) + $this->start_practice) * 1000;
            },
            'quiz_name' => function() {
                $quiz = Quize::find(['id' => $this->quiz->id])->select('name')->one();
                return $quiz->name . ', ' . $this->quiz->subject->subjectOrigin->name;
            },
            'questions' => function() {
                $questions = Question::find()->where(['quize_id' => $this->quiz->id])->all();
                return $questions;
            },
            'viewed',
            'answers',
            'comment'
        ];
    }
}