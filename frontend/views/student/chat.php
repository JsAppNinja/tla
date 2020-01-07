<?php
/**
 * Created by PhpStorm.
 * User: igorpugachev
 * Date: 19.04.16
 * Time: 11:24
 */


?>
<div class="page-header">
    <h2>Chat</h2>
</div>

<div class="row chat" ng-controller="StudentChatController">
    <div class="col-md-4">
        <div class="panel panel-primary">
            <div class="panel-heading">My tutors list</div>
            <div class="list-group">
                <a ui-sref-active="active" href="/student/chat/{{chat.chat_id}}"
                   ng-repeat="chat in chats.users | filter:{type: 0} track by $index"
                   class="list-group-item clearfix">
                    <div class="row">
                        <div class="col-md-3">
                            <img ng-src="{{getAvatar(chat)}}" alt="" class="img-responsive">
                        </div>
                        <div class="col-md-9">
                            <div class="pull-left">
                                <h4 class="list-group-item-heading">{{chat.user.first_name}}
                                    {{chat.user.last_name}}</h4>
                                <span class="label" ng-class="{'label-success': chat.online, 'label-default': !chat.online}">
                                    {{chat.online?'Online':'Offline'}}
                                </span>
                            </div>
                            <div class="pull-right">
                                <div class="badge danger" ng-if="chat.unreadCount">{{chat.unreadCount}}</div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
        <div class="panel panel-warning">
            <div class="panel-heading">Tutors list</div>
            <div class="list-group">
                <a ui-sref-active="active" href="/student/chat/{{chat.chat_id}}"
                   ng-repeat="chat in chats.users | filter:{type: 1, user_type: 2} track by $index"
                   class="list-group-item clearfix">
                    <div class="row">
                        <div class="col-md-3">
                            <img ng-src="{{getAvatar(chat)}}" alt="" class="img-responsive">
                        </div>
                        <div class="col-md-9">
                            <div class="pull-left">
                                <h4 class="list-group-item-heading">{{chat.user.first_name}}
                                    {{chat.user.last_name}}</h4>
                                <span class="label" ng-class="{'label-success': chat.online, 'label-default': !chat.online}">
                                    {{chat.online?'Online':'Offline'}}
                                </span>
                            </div>
                            <div class="pull-right">
                                <div class="badge danger" ng-if="chat.unreadCount">{{chat.unreadCount}}</div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
        <div class="panel panel-success">
            <div class="panel-heading">Students list</div>
            <div class="list-group">
                <a ui-sref-active="active" href="/student/chat/{{chat.chat_id}}"
                   ng-repeat="chat in chats.users | filter:{type: 1, user_type: 1} track by $index"
                   class="list-group-item clearfix">
                    <div class="row">
                        <div class="col-md-3">
                            <img ng-src="{{getAvatar(chat)}}" alt="" class="img-responsive">
                        </div>
                        <div class="col-md-9">
                            <div class="pull-left">
                                <h4 class="list-group-item-heading">{{chat.user.first_name}}
                                    {{chat.user.last_name}}</h4>
                                <span class="label" ng-class="{'label-success': chat.online, 'label-default': !chat.online}">
                                    {{chat.online?'Online':'Offline'}}
                                </span>
                            </div>
                            <div class="pull-right">
                                <div class="badge danger" ng-if="chat.unreadCount">{{chat.unreadCount}}</div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div>
    <div class="col-md-8">
        <div id="sc" class="panel panel-default">
            <div class="panel-heading">Messages list</div>
            <div class="panel-body">
                <h2>Please select a tutor from a list</h2>
            </div>
        </div>
    </div>
</div>
