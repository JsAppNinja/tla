<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 16.11.15
 * Time: 20:33
 */
use yii\helpers\Url;

?>
<style>
    ul {
        margin: 0;
        padding: 0;
    }
</style>
<div class="row">
    <div class="col-md-9">
        <a href="<?= Url::toRoute('student/dashboard/' . $tutor->id) ?>">Back to <?= $tutor->getFullName() ?> workspace</a>
        <div ng-controller="PracticeExamController" ng-init="showQuestions(<?= $quizpractice->id ?>)">
            <form style="opacity:0" action="/student/finish-practice" method="POST" id="practice">
                <input type="hidden" name="_csrf" value="<?= Yii::$app->request->getCsrfToken() ?>"/>
                <input type="hidden" name="quizpractice_id" value="{{practice.id}}">
                <input type="hidden" name="tutor_id" value="<?= $tutor->id ?>">
                <input type="hidden" name="from_list" value="0">
                <div style="position: fixed;z-index: 2000000;top: 30px;right: 73px;" class="visible-xs-block">
                    <div ng-show="timer" class="ng-cloak timer" style="font-size: 20px">
                        <span class="glyphicon glyphicon-time"></span>
                        <timer ng-show="practice.time" interval="1000" end-time="practice.time"
                               finish-callback="stopPractice(true)" language="en">{{hhours}} : {{mminutes}} :
                            {{sseconds}}
                        </timer>
                        <span ng-show="!practice.time">No timer</span>
                    </div>
                    <a href="javascript:;" ng-click="stopPractice(false)" class="btn btn-primary"><span
                            class="glyphicon glyphicon-ok"></span> Finish</a>
                </div>
                <div class="row">
                    <div class="col-md-9 col-sm-9 col-xs-12">
                        <h1 class="exam-title" ng-bind="practice.name"></h1>
                        <ul style="margin: 0;padding: 0;">
                            <li ng-repeat="question in practice.questions track by $index"
                                class="shadowed practice_question">
                                <div class="question" ng-bind-html="trustAsHtml(question.content)" style="margin-bottom: 10px;"></div>
                                <img class="img-responsive" ng-repeat="image in question.images track by $index"
                                     ng-src="{{image.path}}"/>

                                <div ng-show="question.essay" class="form-group">
                                    <label>Type your essay</label>
                                    <textarea ng-model="question.essayText" ng-change="essayChange(question)"
                                              ng-model-options="{ debounce: 3000 }" id="" cols="30" rows="10"
                                              class="form-control"></textarea>
                                </div>
                                <ul ng-hide="question.essay" class="answers_list">
                                    <li ng-repeat="answer in question.answers track by answer.id">
                                        <div class="radio">
                                            <label style="width: 100%;">
                                                <input ng-checked="false"
                                                       ng-click="selectAnswer(question, answer)"
                                                       ng-model="answer.selected" ng-value="answer.selected"
                                                       type="radio" name="answer[{{question.id}}]">
                                                <span class="answer_item" ng-bind-html="trustAsHtml(answer.content)"></span>
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <ul id="questions" class="sections_list">
                            <li ng-repeat="section in practice.sections track by $index">
                                <h2 class="section">Section #{{$index+1}}</h2>
                                <div class="section_title" ng-bind="section.name"></div>
                                <img class="img-responsive" ng-repeat="image in section.images"
                                     ng-src="{{image.path}}"/>
                                <ul>
                                    <li ng-repeat="question in section.questions" class="shadowed practice_question">
                                        <div class="question" ng-bind-html="trustAsHtml(question.content)"
                                             style="margin-bottom: 10px;"></div>
                                        <img class="img-responsive" ng-repeat="image in question.images"
                                             ng-src="{{image.path}}"/>

                                        <div ng-show="question.essay" class="form-group">
                                            <label>Type your essay</label>
                                            <textarea ng-model="question.essayText" ng-change="essayChange(question)"
                                                      ng-model-options="{ debounce: 3000 }" id="" cols="30" rows="10"
                                                      class="form-control"></textarea>
                                        </div>
                                        <ul ng-hide="question.essay" class="answers_list">
                                            <li ng-repeat="answer in question.answers track by answer.id">
                                                <div class="radio">
                                                    <label style="width: 100%;">
                                                        <input ng-checked="false"
                                                               ng-click="selectAnswer(question, answer)"
                                                               ng-model="answer.selected" ng-value="answer.selected"
                                                               type="radio" name="answer[{{question.id}}]">
                                                        <span class="answer_item" ng-bind-html="trustAsHtml(answer.content)"></span>
                                                    </label>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-3 col-sm-3 hidden-xs" id="leftCol">
                        <div class="nav nav-stacked" id="sidebar">
                            <div class="well">
                                <div ng-show="timer" class="ng-cloak timer" style="font-size: 20px">
                                    <span class="glyphicon glyphicon-time"></span>
                                    <timer ng-show="practice.time" interval="1000" end-time="practice.time"
                                           finish-callback="stopPractice(true)" language="en">{{hhours}} : {{mminutes}}
                                        :
                                        {{sseconds}}
                                    </timer>
                                    <span ng-show="!practice.time">No timer</span>
                                </div>
                                <hr>
                                <a href="javascript:;" ng-click="stopPractice(false)" class="btn btn-primary"><span
                                        class="glyphicon glyphicon-ok"></span> Finish</a>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="col-md-3">
        <h3>Schedule</h3>
        <div class="grade_schedule">
            <?= $grade_level->schedule ?>
        </div>
    </div>
</div>
<script type="text/ng-template" id="stopPractice">
    <h3>Finish practice</h3>
    <p>You answered {{cnt}} questions out of {{practice.questions.length + qis}}</p>
    <p>Do you really want to submit now?</p>
    <div class="ngdialog-buttons">
        <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="confirm(1)">Stop practicing
        </button>
        <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="closeThisDialog(0)">Continue
            practicing
        </button>
    </div>
</script>
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
                    top: 130
                }
            });
        })
    })(jQuery);
</script>
