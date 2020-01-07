<?php

namespace frontend\modules\v1\models;

use common\models\Quize;
use frontend\modules\v1\models\Question;
use Yii;


class QuizpracticeList extends \common\models\Quizpractice
{
    public function fields()
    {
        return [
            'id',
            'grade_level' => function () {
                return $this->quiz->subject->examtype->name;
            },
            'student' => function() {
                $student = $this->student->getUserTypeInstance();
                return $student->getFullName();
            },
            'lesson' => function () {
                $lesson = $this->quiz->lesson;
                return $lesson ? $lesson->title : null;
            },
            'quiz' => function () {
                return $this->quiz->name;
            },
            'finished' => function() {
                return date('d F Y G:i A', $this->date_of_exam);
            }
        ];
    }
}