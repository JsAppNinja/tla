<?php

namespace frontend\modules\v1\models;

use Yii;


class Quize extends \common\models\Quize
{
    public function fields()
    {
        return [
            'id',
            'name',
            'description',
            'date',
            'hours',
            'length'=> function() {
                return ($this->hours * 60) * 1000;
            },
            'practice' => function() {
                $quiz_id = $this->id;
                $user_id = Yii::$app->user->id;
                $status = Quizpractice::IN_PROCESS;
                $practice = Quizpractice::find()->where(['quiz_id' => $quiz_id, 'student_id' => $user_id, 'status' => $status])->select('id, start_practice, timer')->one();
                if($practice) {
                    $result['id'] = $practice->id;
                    if($practice->timer) {
                        $result['length'] = ($practice->start_practice + ($this->hours * 60))*1000;
                    } else {
                        $result['length'] = false;
                    }
                } else {
                    $result = false;
                }
                return $result;
            },
            'viewed' => function() {
                $quiz_id = $this->id;
                $user_id = Yii::$app->user->id;
                $status = Quizpractice::FINISHED;
                $practice = Quizpractice::find()->where(['quiz_id' => $quiz_id, 'student_id' => $user_id, 'status' => $status])->orderBy(['id' => SORT_DESC])->one();
                if($practice) {
                    $result['id'] = $practice->id;
                    $result['viewed'] = $practice->viewed;
                } else {
                    $result = null;
                }

                return $result;
            },
            'result_id' => function() {

            },
            'sort',
            'active'
        ];
    }
}