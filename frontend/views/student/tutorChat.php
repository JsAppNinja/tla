<?php
/**
 * Created by PhpStorm.
 * User: igorpugachev
 * Date: 19.04.16
 * Time: 11:35
 */
use yii\helpers\Url;

?>

<div class="page-header">
    <h2>Chat</h2>
</div>

<div class="row chat">
    <div class="col-md-4" ng-controller="StudentChatController">
        <div class="panel panel-default">
            <div class="panel-heading">My tutors list</div>
            <div class="list-group">
                <a href="/student/chat/{{chat.chat_id}}"
                   ng-repeat="chat in chats.users | filter:{type: 0} track by $index"
                   class="list-group-item clearfix"
                   ng-class="{active: chat.chat_id == <?= $chat->id ?>}">
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
                    <div class="row">
                        <div class="col-md-12">
                            <p class="list-group-item-text last-message"></p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
        <div class="panel panel-warning">
            <div class="panel-heading">Tutors list</div>
            <div class="list-group">
                <a ng-class="{active: chat.chat_id == <?= $chat->id ?>}" href="/student/chat/{{chat.chat_id}}"
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
                    <div class="row">
                        <div class="col-md-12">
                            <p class="list-group-item-text last-message"></p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
        <div class="panel panel-success">
            <div class="panel-heading">Students list</div>
            <div class="list-group">
                <a ng-class="{active: chat.chat_id == <?= $chat->id ?>}" href="/student/chat/{{chat.chat_id}}"
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
                    <div class="row">
                        <div class="col-md-12">
                            <p class="list-group-item-text last-message"></p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div>

    <div class="col-md-8" ng-controller="StudentMessagesController" ng-init="onInit(<?= $chat->id ?>)">
        <div id="sc" class="panel panel-default">
            <div class="panel-heading">Messages list</div>
            <div class="panel-body" ng-if="!messages.length">No messages</div>
            <ul class="list-group"
                ng-show="messages.length"
                ng-scrollbars
                ng-scrollbars-config="element.config"
                ng-scrollbars-update="element.updateScrollbar">
                <li class="list-group-item clearfix" ng-repeat="message in messages track by $index">
                    <div class="talk-bubble"
                         ng-class="{
                    'message':message.owner == 0,
                    'pull-left':message.owner == 0,
                    'pull-right':message.owner == 1,
                    'my-message': message.owner == 1,
                     }">
                        <div class="talktext">
                            <p class="message-header clearfix">
                                <span class="message-owner pull-left">{{message.sender}}</span>
                                <span class="message-date pull-right">{{ getTime(message.created_at) }}</span>
                            </p>
                            <p>{{message.body}}</p>
                        </div>
                        <div class="new" ng-if="message.isNew"></div>
                    </div>
                </li>
            </ul>
            <div class="panel-footer clearfix">
                <form ng-submit="sendMessage()">
                    <div class="form-group">
                        <label>Type your message:</label>
                <textarea class="form-control" rows="3" ng-model="newMessage.message" bn-cmd-enter
                          placeholder="Use CDM+Enter to send a message."></textarea>
                    </div>
                    <div class="form-group pull-right">
                        <button type="submit" class="btn btn-primary">Send message</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

