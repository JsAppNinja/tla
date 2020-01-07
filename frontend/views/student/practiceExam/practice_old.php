<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 16.11.15
 * Time: 20:33
 */
use yii\helpers\Url;

?>
<div class="row">
    <div class="col-xs-12">
        <ul class="nav nav-tabs">
            <li><a href="<?= Url::toRoute('student/index') ?>">Subjects</a></li>
            <li class="active"><a href="#">Practice Exam</a></li>
            <li><a href="#">Video</a></li>
            <li><a href="#">Private Tutor</a></li>
            <li><a href="#">School</a></li>
            <li><a href="#">Search</a></li>
        </ul>
    </div>
</div>
<div class="row">
    <div class="col-xs-12">
        <a href="<?= Url::toRoute('student/practice-exam') ?>">Back to quizzes list</a>
        <div ng-controller="PracticeExamController" ng-init="startQuiz(<?= $quiz->id ?>)">
            <form action="/student/finish-practice" method="POST" id="practice">
                <input type="hidden" name="_csrf" value="<?= Yii::$app->request->getCsrfToken() ?>"/>
                <input type="hidden" name="quizpractice_id" value="{{quizpractice.id}}">
                <div class="row">
                    <div class="col-xs-9">
                        <h1><?= $quiz->name ?>, <?= $quiz->subject->subjectOrigin->name ?></h1>
                        <ol id="questions" class="questions_list" data-count="<?= count($quiz->questions) ?>">
                            <?php foreach ($quiz->questions as $id => $question): ?>
                                <li>
                                    <?= strip_tags($question->content) ?>
                                    <div>
                                        <?php foreach ($question->images as $image): ?>
                                            <img src="<?= $image->path ?>" alt="">
                                        <?php endforeach; ?>
                                    </div>
                                    <ul class="answers_list">
                                        <?php foreach ($question->answers as $answer): ?>
                                            <li>
                                                <div class="radio">
                                                    <label>
                                                        <input ng-model="answers" ng-click="selectAnswer(<?= $question->id?>, <?= $answer->id ?>)" type="radio" value="<?= $answer->id ?>"
                                                               name="answers[<?= $question->id ?>]">
                                                        <?= $answer->content ?>
                                                    </label>
                                                </div>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </li>
                                <hr>
                            <?php endforeach; ?>
                        </ol>
                    </div>
                    <div class="col-xs-3" id="leftCol">
                        <div class="nav nav-stacked" id="sidebar">
                            <div class="ng-cloak" style="font-size: 30px">
                                <span class="glyphicon glyphicon-time"></span>
                                <timer interval="1000" end-time="time_start" finish-callback="stopPractice()" language="en">{{hhours}} : {{mminutes}} :
                                    {{sseconds}}
                                </timer>
                            </div>
                            <hr>
                            <button class="btn btn-primary">Finish</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    (function ($) {
        $(function () {

            var $body = $(document.body);
            var navHeight = $('.navbar').outerHeight(true) + 10;

            $body.scrollspy({
                target: '#leftCol',
                offset: navHeight
            });

            $('#sidebar').affix({
                offset: {
                    top: 110
                }
            });
        })
    })(jQuery);
</script>
