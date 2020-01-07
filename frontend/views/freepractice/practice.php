<?php
use yii\helpers\Url;

?>
<style>
    ul {
        margin: 0;
        padding: 0;
    }
</style>
<section class="blue-half-bg"></section>
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="main-container">
                <a href="<?= Url::toRoute('site/index') ?>">Back to quizzes list</a>

                <div class=" row" ng-controller="FreepracticeController" ng-init="showQuestions(<?= $id ?>)">
                    <div class="col-xs-12">
                        <div id="loader">
                            <h1>Loading ...</h1>
                        </div>
                        <form style="opacity:0" action="/freepractice/finish-practice" method="POST" id="practice">
                            <input type="hidden" name="_csrf" value="<?= Yii::$app->request->getCsrfToken() ?>"/>

                            <div style="position: fixed;z-index: 2000000;top: 30px;right: 73px;"
                                 class="visible-xs-block">
                                <a href="javascript:;" ng-click="stopPractice(false)" class="btn btn-primary"><span
                                        class="glyphicon glyphicon-ok"></span> Finish</a>
                            </div>
                            <div class="row">
                                <div class="col-md-9 col-sm-9 col-xs-12">
                                    <h1 class="exam-title" ng-bind="practice.name"></h1>
                                    <ul style="margin: 0;padding: 0;">
                                        <li ng-repeat="question in practice.questions track by $index"
                                            class="shadowed practice_question">
                                            <div class="question" ng-bind="question.content"
                                                 style="margin-bottom: 10px;"></div>
                                            <img class="img-responsive" ng-repeat="image in question.images track by $index"
                                                 ng-src="{{image.path}}"/>

                                            <div ng-show="question.essay" class="form-group">
                                                <label>Type your essay</label>
                                    <textarea ng-model="question.essayText"
                                              id="" cols="30" rows="10"
                                              class="form-control"></textarea>
                                            </div>
                                            <ul ng-hide="question.essay" class="answers_list">
                                                <li ng-repeat="answer in question.answers track by answer.id">
                                                    <div class="radio">
                                                        <label style="width: 100%;">
                                                            <input ng-checked="false"
                                                                   ng-click="question.answered = true"
                                                                   ng-model="answer.selected" ng-value="answer.id"
                                                                   type="radio" name="answer[{{question.id}}]">
                                                            {{answer.content}}
                                                        </label>
                                                    </div>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                    <ul id="questions" class="sections_list">
                                        <li ng-repeat="section in practice.sections">
                                            <h2 class="section">Section #{{$index+1}}</h2>

                                            <div class="section_title" ng-bind="section.name"></div>
                                            <a href="javascript:;" ng-repeat="image in section.images"
                                               ng-click="openLightboxModal(section.images, $index)">
                                                <img ng-src="{{image.path}}" class="img-thumbnail">
                                            </a>
                                            <ul>
                                                <li ng-repeat="question in section.questions"
                                                    class="shadowed practice_question">
                                                    <div class="question" ng-bind="question.content"
                                                         style="margin-bottom: 10px;"></div>
                                                    <img class="img-responsive" ng-repeat="image in question.images"
                                                         ng-src="{{image.path}}"/>

                                                    <div ng-show="question.essay" class="form-group">
                                                        <label>Type your essay</label>
                                            <textarea ng-model="question.essayText"
                                                      id="" cols="30" rows="10"
                                                      class="form-control"></textarea>
                                                    </div>
                                                    <ul ng-hide="question.essay" class="answers_list">
                                                        <li ng-repeat="answer in question.answers track by answer.id">
                                                            <div class="radio">
                                                                <label style="width: 100%;">
                                                                    <input ng-checked="false"
                                                                           ng-click="question.answered = true"
                                                                           ng-model="answer.selected"
                                                                           ng-value="answer.id"
                                                                           type="radio" name="answer[{{question.id}}]">
                                                                    {{answer.content}}
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
                                    <div class="nav nav-stacked freepractice" id="sidebar-free">
                                        <a href="javascript:;" ng-click="stopPractice($event)"
                                           class="btn btn-primary"><span
                                                class="glyphicon glyphicon-ok"></span> Finish practice</a>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
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
                offset: 50
            });

            $('#sidebar-free').affix({
                offset: {
                    top: 50
                }
            });
        })
    })(jQuery);
</script>