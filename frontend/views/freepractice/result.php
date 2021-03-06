<?php

use yii\helpers\Url;


$percent = ceil($result['correct'] / count($quiz->questions) * 100);

$notice = "";

if ($percent < 80) {
    $class = "bad_answer--big";
    $class2 = "red";
    $notice = "For academic excellence you should strive for a minimum of 80% score in each of your tests.<br><br> If you need assistance to get this level please see the <a href='javascript:;' data-toggle='tooltip' data-placement='top' title='Coming soon'>video</a> section for overview and solution videos that will assist you in your topic of challenge. <br><br>You can also seek for assistance from a <a href='javascript:;' data-toggle='tooltip' data-placement='top' title='Coming soon'>tutor</a> or <a href='javascript:;' data-toggle='tooltip' data-placement='top' title='Coming soon'>school</a>.";
} else {
    $class = "right_answer--big";
    $class2 = "green";
}

$rowCount = 4;
$countInRow = 4;
$rowClass = 'col-md-' . (12 / $rowCount);

?>
<section class="blue-half-bg"></section>
<div class="container">
    <a href="<?= Url::toRoute('site/index') ?>">Back to quizzes list</a>
    <div class="main-container">
        <div class="row">
            <div class="col-md-12">
                <div class="row">
                    <div class="col-md-4 col-xs-12">
                        <h1>Result: </h1>
                        <ul class="short_result">
                            <li>Correctly answered questions: <?= $result['correct'] ?></li>
                            <li>Incorrectly answered questions: <?= $result['incorrect'] ?></li>
                            <li>Unanswered questions: <?= $result['notAnswered'] ?></li>
                        </ul>
                    </div>
                    <div class="col-md-8 col-xs-12">
                        <div class="shadowed result_block">
                            <div class="row">
                                <div class="col-md-3">
                                    <span class="<?= $class ?>"></span>
                                </div>
                                <div class="col-md-9">
                                    <span class="<?= $class2 ?>"><?= $percent ?>%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <h3><?= $notice ?></h3>
                        <?php if ($result['topics']): ?>
                            <h1>Details:</h1>
                            <?php
                            $count = 0;
                            $topics = array_values($result['topics']);
                            ?>
                            <?php if (count($result['topics']) > 3): ?>
                                <?php $inColumn = count($result['topics']) / $rowCount; ?>
                                <?php for ($i = 0; $i < $rowCount - 1; $i++): ?>
                                    <div class="column size-1of3">
                                        <div class="topic_title">
                                            <div class="closed"><i class="fa fa-caret-down" aria-hidden="true"></i> <?= $topics[$i]['name'] ?> <?= $topics[$i]['correct'] ?>
                                                /<?= count($topics[$i]['subtopics']) ?></div>
                                            <ul class="details-result-list">
                                                <?php foreach ($topics[$i]['subtopics'] as $subtopic): ?>
                                                    <li><?= $subtopic['name'] ?> <?= $subtopic['correct'] ?>
                                                        /<?= $subtopic['count'] ?></li>
                                                <?php endforeach; ?>
                                            </ul>
                                        </div>
                                        <?php for ($j = 1; $j < $inColumn + 1; $j++): ?>
                                            <div>
                                                <?php if (isset($topics[$i + $j * $rowCount])): ?>
                                                    <div class="topic_title">
                                                        <div class="closed"><i class="fa fa-caret-down" aria-hidden="true"></i> <?= $topics[$i + $j * $rowCount]['name'] ?> <?= $topics[$i + $j * $rowCount]['correct'] ?>
                                                            /<?= count($topics[$i + $j * $rowCount]['subtopics']) ?></div>
                                                        <ul class="details-result-list">
                                                            <?php foreach ($topics[$i + $j * $rowCount]['subtopics'] as $subtopic): ?>
                                                                <li><?= $subtopic['name'] ?> <?= $subtopic['correct'] ?>
                                                                    /<?= $subtopic['count'] ?></li>
                                                            <?php endforeach; ?>
                                                        </ul>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        <?php endfor; ?>
                                    </div>
                                <?php endfor; ?>
                            <?php else: ?>
                                <div class="row">
                                    <?php foreach ($result['topics'] as $topic): ?>
                                        <div class="col-md-4">
                                            <div class="topic_title">
                                                <div class="closed"><i class="fa fa-caret-down" aria-hidden="true"></i> <?= $topic['name'] ?> <?= $topic['correct'] ?>
                                                    /<?= count($topic['subtopics']) ?></div>
                                                <ul class="details-result-list">
                                                    <?php foreach ($topic['subtopics'] as $subtopic): ?>
                                                        <li><?= $subtopic['name'] ?> <?= $subtopic['correct'] ?>
                                                            /<?= $subtopic['count'] ?></li>
                                                    <?php endforeach; ?>
                                                </ul>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="state-legend row">
                            <div class="col-md-4 state"><div class="form-group"><span class="right_answer"></span><span>Correct</span></div></div>
                            <div class="col-md-4 state"><div class="form-group"><span class="bad_answer"></span><span>Incorrect</span></div></div>
                            <div class="col-md-4 state"><div class="form-group"><span class="not_answered"></span><span>Unanswered</span></div></div>
                        </div>
                    </div>
                </div>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12">
                <ol class="questions_list">
                    <?php foreach ($quiz->questions as $question): ?>
                        <?php if (!isset($result['checkedAnswers'][$question->id])) continue; ?>
                        <div class="shadowed result_question">
                            <li class="question"><?= $question->content ?></li>
                            <?php
                            if ($result['checkedAnswers'][$question->id]) {
                                if ($result['checkedAnswers'][$question->id]['correct']) {
                                    $state_class = 'right_answer';
                                } else {
                                    $state_class = 'bad_answer';
                                }
                            } else {
                                $state_class = 'not_answered';
                            }
                            ?>
                            <div class="answers_block row">
                                <div class="state col-xs-12 col-md-2 col-lg-1">
                                    <span class="<?= $state_class ?>"></span>
                                </div>
                                <div class="answers col-xs-12 col-md-10 col-lg-11">
                                    <ol class="answers_list" style="padding: 0;">
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
                                    </ol>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </ol>
            </div>
        </div>
    </div>
</div>
<script>
    MathJax.Hub.Queue(function () {
        $('.questions_list').css('opacity', 1);
    });
    $('[data-toggle="tooltip"]').tooltip();

    $('[data-toggle=popover]').popover({
        content: function () {
            return $(this).siblings('.subtopics_content').html();
        },
        trigger: 'hover',
        html: true
    });

    $('.topic_title > div').on('click', function () {
        if($(this).hasClass('closed')) {
            $(this).find('.fa').removeClass('fa-caret-down').addClass('fa-caret-up');
        } else {
            $(this).find('.fa').removeClass('fa-caret-up').addClass('fa-caret-down');
        }
        $(this).toggleClass('closed');
        var a = $(this).siblings('.details-result-list');
        a.slideToggle();
    });
</script>
