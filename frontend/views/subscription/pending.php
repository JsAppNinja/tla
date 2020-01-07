<?php
/**
 * Created by PhpStorm.
 * User: supostat
 * Date: 03.03.16
 * Time: 17:06
 */
use yii\helpers\Url;

?>

<a href="<?= Url::toRoute('student/practice-exam') ?>">Back to quizzes list</a>

<div class="page-header">
    <h2>Pending ...</h2>
</div>
<h3>We are waiting for confirmation from PayPal, please wait</h3>
<h3>Page will reload after <span id="timer"></span> seconds</h3>

<script>
    var timer = 5;
    document.getElementById('timer').textContent = timer;

    setInterval(function () {
        timer = timer - 1;
        document.getElementById('timer').textContent = timer;
    }, 1000);

    setTimeout(function(){
        window.location.reload(1);
    }, 5000);
</script>