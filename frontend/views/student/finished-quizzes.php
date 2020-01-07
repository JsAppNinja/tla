<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 14.12.15
 * Time: 12:23
 */
use yii\helpers\Url;

?>

<div class="page-header">
    <h2>Finished quizzes</h2>
</div>

<div class="row" ng-controller="FinishedQuizzesController">
    <div class="col-md-12">
        <div class="table-responsive">
            <table class="table vert-align table-striped">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Exam</th>
                    <th>Subject</th>
                    <th>Quiz</th>
                    <th>Result</th>
                    <th>Finished date</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr ng-repeat="quiz in quizzes track by $index">
                    <td>{{$index+1}}</td>
                    <td>{{quiz.exam}}</td>
                    <td>{{quiz.subject}}</td>
                    <td>{{quiz.quiz}}</td>
                    <td ng-class="getResultClass(quiz)"><strong>{{quiz.percentage}}%</strong></td>
                    <td>{{quiz.finished_date}}</td>
                    <td><a href="/student/finished-exam-view?id={{quiz.id}}" class="btn btn-primary">View full info</a></td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>