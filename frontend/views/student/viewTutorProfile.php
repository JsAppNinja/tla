<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 23.03.16
 * Time: 17:56
 */
use yii\helpers\Url;

?>
<div class="page-header">
    <h2>Tutor profile</h2>
</div>
<ol class="breadcrumb">
    <li><a href="<?= Url::toRoute('student/search') ?>">Search for tutor</a></li>
    <li class="active"><?= $tutor->first_name . ' ' . $tutor->last_name ?> profile</li>
</ol>
<div class="row" ng-controller="TutorViewProfileController" ng-init="getTutor(<?= $tutor->id ?>)">
    <div class="col-md-12">
        <div class="tutorCard">
            <div class="media-left">
                <div class="form-group">
                    <img class="media-object" ng-src="{{tutor.avatar?tutor.avatar:'/images/no_avatar2.png'}}" alt="...">
                </div>
                <div class="form-group">
                    <button ng-click="sendRequest(tutor)" ng-if="!tutor.requested && !tutor.educating"
                            class="btn btn-success btn-block"><i class="fa fa-plus"></i> Send request
                    </button>
                </div>
                <div class="form-group text-center">
                    <span class="green" style="font-size: 24px">{{tutor.remaining}} slots left</span>
                </div>
            </div>
            <div class="media-body">
                <div class="tutorCard--title">
                    <span style="margin-right: 40px;">{{tutor.first_name + ' ' + tutor.last_name}}</span>
                    <span ng-if="tutor.requested" class="label label-warning"><i class="fa fa-check"></i> Request sent</span>
                    <span ng-if="tutor.educating" class="label label-success"><i class="fa fa-check"></i> Active</span>
                </div>
                <hr>
                <div class="tutorCard--subjects">
                    <span ng-repeat="subject in tutor.subjects track by $index"><span style="font-size: 20px;" class="green">{{subject.name}}</span></span>
                </div>
                <div class="tutorCard--description">
                    <div class="form-group">
                        <label>Price:</label>
                        <p>Per subject: ${{tutor.price_per_subject}}<br>
                            All subjects: ${{tutor.price_for_all_subjects}}
                        </p>
                    </div>
                    <div class="form-group">
                        <label>Description:</label>

                        <p>{{tutor.profile_description}}</p>
                    </div>
                    <div class="form-group">
                        <label>Payment description:</label>

                        <p>{{tutor.payment_description}}</p>
                    </div>
                    <div class="form-group">
                        <label>Skype:</label>

                        <p>{{tutor.skype}}</p>
                    </div>
                    <div class="form-group">
                        <label>Phone:</label>

                        <p>{{tutor.phone}}</p>
                    </div>
                </div>
                <div class="tutorCard--sampleVideo">
                    <label>Sample video:</label>

                    <div class="embed-responsive embed-responsive-16by9" ng-bind-html="tutor.iframe">

                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
