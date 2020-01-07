<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 14.12.15
 * Time: 12:24
 */
?>

<div class="page-header">
    <h2>Account settings</h2>
</div>

<ul class="nav nav-tabs">
    <li class="active"><a data-toggle="tab" href="#profile">Profile</a></li>
    <li><a data-toggle="tab" href="#password">Change password</a></li>
</ul>

<div class="tab-content" ng-controller="StudentProfileController">
    <div id="profile" class="tab-pane fade in active">
        <form name="frmStudentProfile" novalidate>

            <div class="row">
                <div class="col-md-2">
                    <a href="javascript:;" class="thumbnail">
                        <img ng-src="{{profile.avatar?profile.avatar:'/images/no_avatar2.png'}}" alt="Avatar">
                    </a>
                </div>
            </div>
            <div class="row">
                <div class="col-md-2">
                    <div class="form-group">
                        <button class="btn btn-primary" ng-click="changeAvatar()">Change avatar</button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-5">
                    <div class="form-group">
                        <label>First name</label>
                        <input type="text" class="form-control" ng-model="profile.first_name">
                    </div>
                    <div class="form-group">
                        <label>Last name</label>
                        <input type="text" class="form-control" ng-model="profile.last_name">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-5">
                    <button class="btn btn-primary" ng-click="saveProfile(profile)">Save profile</button>
                </div>
            </div>
        </form>
    </div>
    <div id="password" class="tab-pane fade">
        <form name="frmChangePassword" novalidate>
            <div class="row">
                <div class="col-md-5">
                    <div class="form-group required">
                        <label class="control-label">Old password</label>
                        <input type="password" name="oldPassword" class="form-control" required
                               ng-model="password.oldPassword">
                    </div>
                    <div class="form-group required">
                        <label class="control-label">New password</label>
                        <input type="password" name="newPassword" class="form-control" required
                               ng-model="password.newPassword">
                    </div>
                    <div class="form-group required">
                        <label class="control-label">Confirm new password</label>
                        <input type="password" name="newPasswordConfirm" class="form-control" required
                               ng-model="password.confirmNewPassword">
                    </div>
                    <div class="form-group">
                        <button ng-click="changePassword(password)" ng-disabled="getDisabled(password)" class="btn btn-primary">Change password</button>
                    </div>
                </div>
                <div class="col-md-5">
                    <span ng-show="frmChangePassword.oldPassword.$invalid">Old password cannot be blank</span><br>
                    <span ng-show="frmChangePassword.newPassword.$invalid">New password cannot be blank</span><br>
                    <span
                        ng-show="frmChangePassword.confirmNewPassword.$invalid">New password confirm cannot be blank</span><br>
                    <span ng-show="password.newPassword != password.confirmNewPassword">New password and confirmation password should match</span><br>
                </div>
            </div>
        </form>
    </div>
</div>
