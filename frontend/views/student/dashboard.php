<?php
use yii\helpers\StringHelper;
use yii\helpers\Url;

?>

<div class="page-header">
    <h2>Student dashboard</h2>
</div>
<div class="row">
    <?php
    if(!$studentTutors): ?>
        <div class="col-md-12">
            <h3>You have no tutors yet. <a href="<?= Url::toRoute('search') ?>">Find your first one!</a></h3>
        </div>
    <?php endif; ?>
    <?php foreach ($studentTutors as $tutor): ?>
    <div class="col-md-12 tutorCard">
        <div class="tutorCard--container">
            <div class="media-left">
                <img width="171" class="media-object thumbnail"
                     src="<?= $tutor->avatar ? $tutor->getAvatar() : '/images/no_avatar2.png' ?>" alt="...">
            </div>
            <div class="media-body">
                <div class="tutorCard--title">
                    <span style="margin-right: 40px;"><?= $tutor->getFullName() ?></span>
                </div>
                <hr>
                <div class="tutorCard--subjects">
                    <?php foreach ($tutor->tutorSubjects as $subject): ?>
                        <span><?= $subject->name ?></span>
                    <?php endforeach; ?>
                </div>
                <div class="tutorCard--description">
                    <p><?= StringHelper::truncateWords($tutor->profile_description, 20, ' ...')  ?></p>
                </div>
                <div class="form-group col-md-3">
                    <a href="/student/search/<?= $tutor->id ?>" class="btn btn-primary"><i class="fa fa-bars"></i> More
                        about
                        profile</a>
                </div>
                <div class="form-group col-md-2">
                    <a href="/student/chat/<?= $tutor->getAcceptedStudentChat() ?> " class="btn btn-primary"><i class="fa fa-comments"></i> Chat</a>
                </div>
                <div class="form-group col-md-3">
                    <a href="/student/dashboard/<?= $tutor->id ?>" class="btn btn-primary"><i class="fa fa-graduation-cap"></i> View lessons</a>
                </div>
            </div>
        </div>
    </div>
    <?php endforeach; ?>
</div>