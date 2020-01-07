<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 06.04.16
 * Time: 12:13
 */
?>
<div class="page-header">
    <h2><?= $tutor->getFullName() ?></h2>
</div>
<div class="row" ng-controller="StudentTutorController"
     ng-init="init(<?= $tutor->id ?>,'<?= $student->getAvatarPath() . $student->avatar ?>')">
    <div class="col-md-12" ng-show="!gradeLevels.length">
        <h2>Not allowed</h2>
    </div>
    <div class="col-md-9" ng-show="gradeLevels.length">
        <div class="row">
            <div class="col-md-3">
                <label>Grade levels</label>
                <ui-select ng-model="selectedGradeLevel.value" on-select="onSelectGrade($item, $model)">
                    <ui-select-match placeholder="Select grade level">
                        <span ng-bind="$select.selected.name"></span>
                    </ui-select-match>
                    <ui-select-choices
                        repeat="level in (gradeLevels | filter: $select.search) track by $index">
                        <span ng-bind="level.name"></span>
                    </ui-select-choices>
                </ui-select>
            </div>
            <div class="col-md-3" ng-show="selectedGradeLevel">
                <label>Subjects</label>
                <ui-select ng-model="selectedSubject.value" on-select="onSelectSubject($item, $model)">
                    <ui-select-match placeholder="Select subject">
                        <span ng-bind="$select.selected.name"></span>
                    </ui-select-match>
                    <ui-select-choices
                        repeat="subject in (subjects | filter: $select.search) track by subject.id">
                        <span ng-bind="subject.name"></span>
                    </ui-select-choices>
                </ui-select>
            </div>
            <div class="col-md-4" ng-show="selectedSubject.value">
                <label>Lessons</label>
                <ui-select ng-model="selectedLesson.value" on-select="onSelectLesson($item)">
                    <ui-select-match placeholder="Select lesson">
                        <span ng-bind="$select.selected.name"></span>
                    </ui-select-match>
                    <ui-select-choices
                        repeat="lesson in (lessons | filter: $select.search) track by lesson.id">
                        <span ng-bind="lesson.name"></span>
                    </ui-select-choices>
                </ui-select>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <h2>{{viewedLesson.title}}</h2>
                <p class="lessonDescription">
                    {{viewedLesson.description }}
                </p>
                <uib-tabset>
                    <uib-tab heading="Videos">
                        <div class="materialsList" data-ng-repeat="video in viewedLesson.videos track by $index">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="embed-responsive embed-responsive-16by9">
                                        <div ng-bind-html="video.HTMLIframe" class="embed-responsive-item">

                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h3 ng-bind="video.title"></h3>
                                    <p class="quizDescription" ng-bind="video.description | truncate:50"></p>
                                </div>
                            </div>
                        </div>
                    </uib-tab>
                    <uib-tab heading="Quizzes">
                        <h3 ng-if="!viewedLesson.quizzes.length">Empty</h3>
                        <div class="materialsList" data-ng-repeat="quiz in viewedLesson.quizzes track by $index">
                            <h3 ng-bind="quiz.name"></h3>
                            <p class="quizDescription" ng-bind="quiz.description"></p>
                            <div class="form-group">
                                <a ng-href="/student/start-tutor-practice?{{'quiz_id='+quiz.id}}"
                                   class="btn btn-primary">Start
                                    quiz</a>
                            </div>
                        </div>

                    </uib-tab>
                    <uib-tab heading="Notes">
                        <h3 ng-if="!viewedLesson.notes.length">Lesson doesn't have any notes</h3>
                        <div class="materialsList" ng-if="viewedLesson.notes.length"
                             ng-repeat="note in viewedLesson.notes track by $index">
                            <h3 ng-bind="note.title"></h3>
                            <p ng-bind="note.description"></p>

                            <div class="form-group">
                                <span>File name: {{note.origin_file_name}}</span>
                            </div>
                            <a ng-href="{{note.file_path + '/' + note.file_name}}"
                               download="{{note.origin_file_name}}" class="btn btn-primary btn-xs"
                               title="Download note"><i
                                    class="fa fa-download"></i> Download file</a>
                        </div>
                    </uib-tab>
                    <uib-tab heading="Assignments">
                        <h3 ng-if="!viewedLesson.assignments.length">Lesson doesn't have any assignments</h3>
                        <div class="materialsList" ng-if="viewedLesson.assignments.length"
                             ng-repeat="assignment in viewedLesson.assignments track by $index">
                            <h3 ng-bind="assignment.name"></h3>
                            <p ng-bind="assignment.description"></p>

                            <div class="form-group">
                                    <span ng-repeat="f in assignment.files track by $index"
                                          style="margin-right: 20px;position: relative;"
                                    ><i class="file-ico"></i><a
                                            ng-href="{{'/uploads/assignments/' + assignment.id + '/' + f.name}}"
                                            download="{{f.origin_name}}" style="padding-left: 17px;"
                                            title="Download note">{{f.origin_name}}</a></span>
                            </div>
                            <div class="form-group">
                                <span><i class="fa"
                                         aria-hidden="true"
                                         ng-class="{'fa-caret-down': !assignment.showComments, 'fa-caret-up': assignment.showComments}"
                                    ></i> <strong
                                        style="cursor: pointer;"
                                        ng-click="assignment.showComments = !assignment.showComments"
                                    >Comments</strong></span>

                            </div>
                            <div class="form-group" ng-show="assignment.showComments">
                                <div class="panel panel-default">
                                    <div class="panel-heading">Comments list</div>
                                    <div class="panel-body">
                                        <div class="row">
                                            <div class="col-md-7">
                                                <p ng-repeat="f in assignment.student_files track by $index"
                                                         style="margin-right: 20px;position: relative;"
                                                    ><i class="file-ico"></i><a
                                                            ng-href="{{'/uploads/assignments/' + assignment.id + '/' + f.name}}"
                                                            download="{{f.origin_name}}" style="padding-left: 17px;"
                                                            title="Download note">{{f.origin_name}}</a></p>
                                            </div>
                                            <div class="col-md-5">
                                                    <div class="form-group">
                                                        <button class="btn btn-primary pull-right"
                                                                ngf-select
                                                                accept="'.png,.jpg,.docx,.pdf,.doc,.txt,.xls,.xlsx'"
                                                                ng-show="!assignment.student_file"
                                                                ng-model="assignment.student_file"><i
                                                                class="fa fa-upload" aria-hidden="true"></i> Attach
                                                            file
                                                        </button>
                                                        <button class="btn btn-primary pull-right"
                                                                ng-show="assignment.student_file" ng-click="upload(assignment)"><i
                                                                class="fa fa-upload" aria-hidden="true"></i> Upload file
                                                        </button>
                                                    </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ul class="list-group">
                                        <li class="list-group-item"
                                            ng-repeat="comment in assignment.comments.data track by $index">
                                            <div class="media">
                                                <div class="media-left">
                                                    <a href="#">
                                                        <img width="75" class="media-object"
                                                             ng-src="{{getAvatar(assignment.comments, comment)}}"
                                                             alt="...">
                                                    </a>
                                                </div>
                                                <div class="media-body">
                                                    <div class="form-group">
                                                        <p>{{comment.body}}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                    <div class="panel-footer">
                                        <div class="media">
                                            <div class="media-left">
                                                <a href="#">
                                                    <img width="75" class="media-object" ng-src="{{student.avatar}}"
                                                         alt="...">
                                                </a>
                                            </div>
                                            <div class="media-body">
                                                <form name="frmAssignment"
                                                      ng-submit="addComment(student, assignment, frmAssignment)"
                                                      novalidate>
                                                    <div class="form-group">
                                                        <textarea class="form-control" ng-model="assignment.newComment"
                                                                  rows="4" required></textarea>
                                                    </div>
                                                    <div class="form-group clearfix">
                                                        <div class="pull-right">
                                                            <button class="btn btn-primary">
                                                                Send
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </uib-tab>
                </uib-tabset>
            </div>
        </div>
    </div>

    <div class="col-md-3">
        <div class="form-group" ng-show="gradeLevels.length">
            <h3>Schedule</h3>
            <div class="grade_schedule">
                <p ng-bind-html="selectedGradeLevel.value.schedule"></p>
            </div>
        </div>
        <div class="form-group" ng-show="students.length">
            <h3>Students</h3>

            <div class="form-group">
                <div class="media" ng-repeat="student in students track by $index">
                    <div class="media-left">
                        <a href="#">
                            <img width="50" class="media-object" ng-src="{{getStudentAvatar(student.data)}}" alt="...">
                        </a>
                    </div>
                    <div class="media-body">
                        <div class="form-group">
                            <p class="ng-binding">{{student.data.first_name + ' ' + student.data.last_name}}</p>
                            <button ng-if="!student.hasChat" class="btn btn-success btn-xs" ng-click="addChat(student)">
                                <i class="fa fa-plus"></i> Add to chat list
                            </button>
                            <button ng-if="student.hasChat" class="btn btn-danger btn-xs"
                                    ng-click="removeChat(student)"><i class="fa fa-minus"></i> Remove from chat list
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>