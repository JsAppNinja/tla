<?php
?>
<div class="page-header">
    <h2>Search for tutor</h2>
</div>

<div ng-controller="TutorSearchController">
    <div class="row">
        <div class="col-md-12">
            <div>
                <div class="row">
                    <div class="form-group col-md-3">
                        <label>Tutor</label>
                        <ui-select ng-model="selectedTutor.value" on-select="searchTutor($item)">
                            <ui-select-match placeholder="Select tutor" allow-clear="true">
                                <span ng-bind="$select.selected.first_name + ' ' + $select.selected.last_name"></span>
                            </ui-select-match>
                            <ui-select-choices repeat="tutor in (tutors | filter: $select.search) track by tutor.id">
                                <span
                                    ng-bind-html="(tutor.first_name + ' ' + tutor.last_name) | highlight: $select.search"></span>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                    <div class="form-group col-md-3" ng-if="!selectedTutor.value">
                        <label>Subject</label>
                        <ui-select ng-model="selectedSubject.value" on-select="searchSubject($item)">
                            <ui-select-match placeholder="Select subject" allow-clear="true">
                                <span ng-bind="$select.selected.name"></span>
                            </ui-select-match>
                            <ui-select-choices
                                repeat="subject in (subjects | filter: $select.search) track by subject.id">
                                <span ng-bind="subject.name"></span>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                    <div class="col-md-3" ng-if="!selectedTutor.value">
                        <rzslider rz-slider-model="slider.minValue"
                                  rz-slider-high="slider.maxValue"
                                  rz-slider-options="slider.options"></rzslider>
                    </div>
                    <div class="form-group col-md-3" ng-if="!selectedTutor.value">
                        <label>Price type per month</label>
                        <ui-select ng-model="selectedPriceType.value" on-select="changePriceType($item)">
                            <ui-select-match placeholder="Price type per month">
                                <span ng-bind="$select.selected.name"></span>
                            </ui-select-match>
                            <ui-select-choices
                                repeat="priceType in (priceTypes | filter: $select.search) track by priceType.id">
                                <span ng-bind="priceType.name"></span>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-12" ng-show="totalItems > maxSize">
            <uib-pagination items-per-page="maxSize" total-items="totalItems" ng-model="currentPage" ng-change="pageChanged()"></uib-pagination>
        </div>
        <div class="col-md-12" ng-if="!showingTutors.length">
            <h2>Nothing found ...</h2>
        </div>
        <div class="col-md-12 tutorCard" ng-repeat="tutor in showingTutors track by $index">
            <div class="tutorCard--container">
                <div class="media-left">
                    <img width="171" class="media-object thumbnail"
                         ng-src="{{tutor.avatar?tutor.avatar:'/images/no_avatar2.png'}}" alt="...">
                </div>
                <div class="media-body">
                    <div class="tutorCard--title">
                        <div class="row">
                            <div class="col-md-12">
                                    <span
                                        style="margin-right: 40px;">{{tutor.first_name + ' ' + tutor.last_name}}</span>

                                    <span style="font-size: 20px;" class="pull-right"
                                          ng-if="tutor.price_per_subject && selectedPriceType.value.id == 0"><strong>${{tutor.price_per_subject}}</strong> per subject</span>
                                    <span style="font-size: 20px;" class="pull-right"
                                          ng-if="tutor.price_for_all_subjects && selectedPriceType.value.id == 1"><strong>${{tutor.price_for_all_subjects}}</strong> for all subjects</span>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="tutorCard--subjects col-md-12">
                            <p style="font-size: 20px;" class="green">{{tutor.subjectList}}</p>
                        </div>
                        <div class="tutorCard--description col-md-12">
                            <p ng-bind="tutor.profile_description | truncate:40"></p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-2">
                            <a href="/student/search/{{tutor.id}}" class="btn btn-primary btn-block"><i
                                    class="fa fa-bars"></i> My profile</a>
                        </div>
                        <div class="col-md-3">
                            <button ng-if="!tutor.hasChat" ng-click="createChat(tutor)" class="btn btn-primary btn-block"><i class="fa fa-comments-o" aria-hidden="true"></i> Add to chat list</button>
                            <button ng-if="tutor.hasChat" ng-click="removeChat(tutor)" class="btn btn-danger btn-block"><i class="fa fa-comments-o" aria-hidden="true"></i> Remove from chat list</button>
                        </div>
                        <div class="form-group col-md-3">
                            <button ng-if="!tutor.requested && !tutor.educating" class="btn btn-success btn-block"
                                    ng-click="sendRequest(tutor)"><i
                                    class="fa fa-plus"></i> Send request
                            </button>
                                <span ng-if="tutor.educating"
                                      style="font-size:100%;padding: 10px 17px;font-weight: 400;"
                                      class="label label-success btn-block"><i class="fa fa-check"></i> Active</span>
                                <span style="font-size:100%;padding: 10px 17px;font-weight: 400;"
                                      ng-if="tutor.requested" class="btn-block label label-warning"><i
                                        class="fa fa-check"></i> Request sent</span>
                        </div>
                        <div class="form-group col-md-3">
                            <span class="green" style="font-size: 24px">{{tutor.remaining}} slots left</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-12" ng-show="totalItems > maxSize">
            <uib-pagination items-per-page="maxSize" total-items="totalItems" ng-model="currentPage" ng-change="pageChanged()"></uib-pagination>
        </div>
    </div>
</div>
