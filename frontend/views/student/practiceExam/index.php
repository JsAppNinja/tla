<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 16.11.15
 * Time: 17:11
 */
use yii\bootstrap\Nav;
use yii\bootstrap\NavBar;
use yii\helpers\Url;


?>


<div class="row b-start-box">
    <div class="col-xs-12">
        <div ng-controller="PracticeExamListController">
            <div class="row">
                <div class="col-xs-12">
                    <ul class="nav nav-tabs">
                        <li class="active"><a data-toggle="tab" href="#practice">Exam practice</a></li>
                        <li><a data-toggle="tab" href="#videos">Videos</a></li>
                    </ul>
                    <div class="tab-content">
                        <div id="practice" class="tab-pane fade in active">
                            <div class="page-header">
                                <h2>Exam practice</h2>
                            </div>
                            <div class="exams-filter">
                                <div class="row">
                                    <div class="col-md-3 col-xs-12">
                                        <div class="form-group">
                                            <label for="">Exam type</label>
                                            <select ng-options="exam_type.name for exam_type in exam_types"
                                                    ng-model="selectedExamType" class="form-control"></select>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-xs-12">
                                        <div class="form-group">
                                            <label for="">Subject</label>
                                            <select ng-options="subject.name for subject in subjects"
                                                    ng-model="selectedSubject"
                                                    class="form-control"></select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xs-12 col-md-3">
                                        <div class="form-group">
                                            <select ng-model="selectedFilterType"
                                                    ng-options="filterType.name for filterType in filterTypes"
                                                    class="form-control"></select>
                                        </div>
                                    </div>
                                    <div class="col-xs-12 col-md-12">
                                        <div class="row ng-cloak"
                                             ng-show="selectedFilterType.name == 'Standard'?false:true">
                                            <div class="col-xs-12 col-md-3">
                                                <div class="form-group">
                                                    <select ng-model="selectedQuestionNumber"
                                                            ng-options="qn for qn in questionNumber"
                                                            class="form-control">
                                                        <option value="">Number of questions</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-xs-12 col-md-1">
                                                <div class="form-group">
                                                    <div class="checkbox">
                                                        <label style="color: #000">
                                                            <input type="checkbox" ng-model="timer"> Timer
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xs-12 col-md-4">
                                                <div class="form-group">
                                                    <select ng-show="topics.length" ng-model="selectedTopic"
                                                            ng-options="topic.name for topic in topics"
                                                            class="form-control">
                                                        <option value="">All</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-xs-12 col-md-4">
                                                <div class="form-group">
                                                    <select ng-show="subtopics.length" ng-model="selectedSubTopic"
                                                            ng-options="subtopic.name for subtopic in subtopics"
                                                            class="form-control">
                                                        <option value="">All</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-xs-12">
                                    <h1 ng-hide="exams.length" class="ng-hide">No Exams found ...</h1>
                                    <table class="ng-cloak styled">
                                        <tr ng-repeat="exam in exams track by $index">
                                            <td>
                                                {{exam.name}}
                                                (Exam length: {{getLength(exam.length)}} )
                                            </td>
                                            <td class="start-button">
                                                <a ng-show="exam.practice"
                                                   ng-href="start-practice?{{'quiz_id='+exam.id}}"
                                                   class="btn pull-right">
                                    <span>
                                        Continue (<timer ng-show="exam.practice.length" interval="1000"
                                                         end-time="exam.practice.length"
                                                         finish-callback="stopPractice(exam)" language="en">{{hhours}} :
                                            {{mminutes}} : {{sseconds}}
                                        </timer>
                                        <span ng-show="!exam.practice.length">Time is not counted</span>)
                                    </span>
                                                </a>
                                                <a ng-show="!exam.practice && (exam.viewed == null || exam.viewed['viewed'] == null)"
                                                   ng-href="start-practice?{{'quiz_id='+exam.id}}{{!timer?'&timer='+timer:''}}{{selectedQuestionNumber?'&qn='+selectedQuestionNumber:''}}{{selectedTopic?'&topic='+selectedTopic.id:''}}{{selectedSubTopic?'&subtopic='+selectedSubTopic.id:''}}"
                                                   class="btn pull-right">
                                    <span>
                                        Start
                                    </span>
                                                </a>
                                                <a ng-show="!exam.practice && (exam.viewed == 1 || exam.viewed['viewed'] == 1)"
                                                   ng-href="start-practice?{{'quiz_id='+exam.id}}{{!timer?'&timer='+timer:''}}{{selectedQuestionNumber?'&qn='+selectedQuestionNumber:''}}{{selectedTopic?'&topic='+selectedTopic.id:''}}{{selectedSubTopic?'&subtopic='+selectedSubTopic.id:''}}"
                                                   class="btn pull-right">
                                    <span>
                                        Start over
                                    </span>
                                                </a>
                                                <a ng-show="!exam.practice && exam.viewed['viewed'] == 0"
                                                   ng-href="finished-exam-view?{{'id='+exam.viewed['id']}}"
                                                   class="btn pull-right">
                                    <span>
                                        View last result
                                    </span>
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div id="videos" class="tab-pane fade in">
                            <div class="page-header">
                                <h2>Videos</h2>
                            </div>
                            <div class="exam-filter">
                                <div class="row">
                                    <div class="col-md-3 col-xs-12">
                                        <div class="form-group">
                                            <label for="">Subject</label>
                                            <ui-select ng-model="selectedVideosSubject.value"
                                                       on-select="onVideoSubjectSelect($item)">
                                                <ui-select-match placeholder="Select subject" allow-clear="true">
                                                    <span
                                                        ng-bind="$select.selected.name"></span>
                                                </ui-select-match>
                                                <ui-select-choices
                                                    repeat="subject in (videosSubjects | filter: $select.search) track by subject.id">
                                            <span
                                                ng-bind-html="subject.name | highlight: $select.search"></span>
                                                </ui-select-choices>
                                            </ui-select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="row">
                                    <div class="col-md-8 free-video__item" ng-repeat="video in videos track by $index">
                                        <div class="row clearfix">
                                            <div class="col-md-9">
                                                <h4>{{video.title}}</h4>
                                            </div>
                                            <div class="col-md-3 text-right">
                                                <h4>{{video.subject.name}}</h4>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-3">
                                                <img class="img-responsive" src="{{video.preview_img}}" alt="...">
                                            </div>
                                            <div class="col-md-6">
                                                {{video.description}}
                                            </div>
                                            <div class="col-md-3 viewVideoButton text-right">
                                                <?php if($subscribed): ?>
                                                    <button class="btn btn-primary" ng-click="showVideo(video)">View
                                                    </button>
                                                <?php else: ?>
                                                    <button ng-if="video.free == 1" class="btn btn-primary" ng-click="showVideo(video)">View
                                                    </button>
                                                    <a ng-if="video.free == 0" href="/buy" class="btn btn-primary">Buy subscription</a>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
