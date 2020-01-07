<?php

use yii\helpers\Url;

$percent = ceil($result['correct'] / count($result['checkedAnswers']) * 100);

$notice = "";

if ($percent < 80) {
    $class = "red";
    $notice = "For academic excellence you should strive for minimum 80% score in each of your test. If you need help to get this level please see the <a href='#'>video</a> section for overview and solution videos that will assist you in your topic of challenge. You can also seek for assistance from a <a href='#'>tutor</a> or <a href='#'>school</a>.";
} else {
    $class = "green";
}
?>
<div class="row">
    <div class="col-xs-12">
        <a href="<?= $backUrl['url'] ?>"><?= $backUrl['text'] ?></a>
    </div>
</div>
<div class="row">
    <div class="col-xs-12">
        <h1>Result: <span class="<?= $class ?>"><?= $percent ?>%</span></h1>
        <ul>
            <li>Correct answered questions: <?= $result['correct'] ?></li>
            <li>Incorrect answered questions: <?= $result['incorrect'] ?></li>
            <li>Not answered questions: <?= $result['notAnswered'] ?></li>
        </ul>
        <h3><?= $notice ?></h3>
        <?php if ($result['topics']): ?>
            <h1>Details:</h1>
            <?php foreach ($result['topics'] as $topic): ?>
                <h3><?= $topic['name'] ?></h3>
                <ul class="details-result-list">
                    <?php foreach ($topic['subtopics'] as $subtopic): ?>
                        <li>
                            <div><strong><?= $subtopic['name'] ?></strong></div>
                            Correct answers: <?= $subtopic['correct'] ?>/<?= $subtopic['count'] ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endforeach; ?>
        <?php endif; ?>
        <br>

        <div class="state-legend">
            <div class="state">
                <span class="glyphicon glyphicon-ok green"> - Passed</span>
            </div>
            <div class="state">
                <span class="glyphicon glyphicon-remove red"> - Wrong</span>
            </div>
            <div class="state">
                <span class="glyphicon glyphicon-minus red"> - Not answered</span>
            </div>
        </div>
        <hr>
    </div>
</div>
<div class="row">
    <div class="col-xs-12">
        <ol class="questions_list">
            <?php foreach ($quizpractice->quiz->questions as $question): ?>
                <?php if (!isset($result['checkedAnswers'][$question->id])) continue; ?>
                <li>
                    <?= $question->content ?>
                    <?php if ($question->images): ?>
                        <div>
                            <?php foreach ($question->images as $image): ?>
                                <img src="<?= $image->path ?>" alt="">
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </li>
                <?php
                if ($result['checkedAnswers'][$question->id]) {
                    if ($result['checkedAnswers'][$question->id]['correct']) {
                        $state_class = 'glyphicon glyphicon-ok green';
                    } else {
                        $state_class = 'glyphicon glyphicon-remove red';
                    }
                } else {
                    $state_class = 'glyphicon glyphicon-minus red';
                }
                ?>
                <div class="answers_block">
                    <div class="state">
                        <span class="<?= $state_class ?>"></span>
                    </div>
                    <div class="answers">
                        <ul class="answers_list">
                            <?php foreach ($question->answers as $id => $answer): ?>
                                <?php
                                $class = '';
                                if ($result['checkedAnswers'][$question->id]['correct']) {
                                    if ($answer->id == $result['checkedAnswers'][$question->id]['right']) {
                                        $class = 'bg-success';
                                    }
                                } else {
                                    if ($answer->id == $result['checkedAnswers'][$question->id]['my']) {
                                        $class = 'bg-danger';
                                    }
                                    if ($answer->id == $result['checkedAnswers'][$question->id]['right']) {
                                        $class = 'bg-success';
                                    }
                                }
                                ?>
                                <li class="<?= $class ?>"><?= $answer->content ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                </div>
                <hr>
            <?php endforeach; ?>
        </ol>
    </div>
</div>

<script>
    MathJax.Hub.Queue(function () {
        $('.questions_list').css('opacity', 1);
    });
</script>
