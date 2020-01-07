<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 22.01.16
 * Time: 13:51
 */

namespace common\presenters\PracticeExam;

use common\models\Quizpractice;

class FinishedQuizzes extends Quizpractice
{

    public function fields()
    {
        return [
            'id',
            'exam' => function() {
                if(!$this->quiz) {
                    return '';
                }
                return $this->quiz->subject->examtype->name;
            },
            'subject' => function() {
                if(!$this->quiz) {
                    return '';
                }
                return $this->quiz->subject->subjectOrigin->name;
            },
            'quiz' => function() {
                if(!$this->quiz) {
                    return '';
                }
                return $this->quiz->name;
            },
            'finished_date' => function () {
                return date('d F Y G:i A', $this->date_of_exam);
            },
            'percentage',
        ];
    }

    public static function tableName()
    {
        return 'quizpractice';
    }
}