<?php
/* @var $this yii\web\View */

use yii\widgets\Breadcrumbs;

$this->title = 'Subject';
$this->params['subject-breadcrumbs'][] = ['label' => $subject->examtype->name, 'url'=>['manage/exam/'.$subject->examtype->id]];
$this->params['subject-breadcrumbs'][] = $subject->subjectOrigin->name;

?>


<ul class="nav nav-tabs">
    <li role="presentation" class="active"><a href="#"> Subjects </a></li>
</ul>

<?= Breadcrumbs::widget([
    'homeLink' => [
        'label' => $breadCrumbLabel,
        'url' => \yii\helpers\Url::to(['manage/index']),
    ],
    'links' => isset($this->params['subject-breadcrumbs']) ? $this->params['subject-breadcrumbs'] : [],
    'options' => [
        'class' => 'breadcrumb subject-breadcrumbs',
    ],
]) ?>

<div>
    <ul class="nav nav-tabs">
        <li role="presentation" class="active"><a href="#/manage/exam/<?= $subject->examtype->id ?>/subject/<?= $subject->id ?>/video" data-toggle="tab">Video</a></li>
        <li role="presentation"><a href="#/manage/exam/<?= $subject->examtype->id ?>/subject/<?= $subject->id ?>/notes" data-toggle="tab">Notes</a></li>
        <li role="presentation"><a href="#/manage/exam/<?= $subject->examtype->id ?>/subject/<?= $subject->id ?>/quiz" data-toggle="tab">Quiz</a></li>
        <li role="presentation"><a href="#/manage/exam/<?= $subject->examtype->id ?>/subject/<?= $subject->id ?>/assignments" data-toggle="tab">Assignments</a></li>
    </ul>
    <div class="tab-content">
        <div role="tabpanel" class="tab-pane fade in active" id="video">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis dicta eligendi numquam repellendus vitae! Dolorum ipsum nesciunt nostrum praesentium totam.</div>
        <div role="tabpanel" class="tab-pane fade" id="notes">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda cupiditate illo incidunt porro quisquam suscipit veniam. Ab adipisci dolorem ex inventore iusto maiores odio quaerat, quibusdam quos reiciendis saepe tenetur!</div>
        <div role="tabpanel" class="tab-pane fade" id="quiz" ng-controller="QuizCtrl as Quiz" data-examId="<?= $subject->examtype->id ?>"
             data-subjectId="<?= $subject->id ?>">
            <?= $this->render('quiz/list', compact('subject')); ?>
        </div>
        <div role="tabpanel" class="tab-pane fade" id="assignments">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda, non.</div>
    </div>
</div>
