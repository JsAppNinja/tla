<div class="welcome-msg">
    <h1>Hello,</h1>
    <p><?= $model->user->first_name ?> <?= $model->user->first_name ?>
        is requesting for payment assistance to access educational materials on <a href="http://passgeek.com">www.passgeek.com</a>.
        PassGeek holds a huge library of past exam questions and learning videos that students can use in preparation for their exams.
        Students can also get tutoring from online tutors on PassGeek's platform.</p>
    <p>Making a payment of $<?= $model->student_monthly ?>.00 USD on behalf of <?= $model->user->first_name ?> <?= $model->user->first_name ?> to access PassGeek is an investment towards he or she passing their exams.</p>
    <p>Use the link below to make the payment</p>
    <h2><a href="<?= $model->userLink ?>"><?= $model->userLink ?></a></h2>
    <p>If you have questions or want more information please contact us on 999-999-9999 or 666-666-6666</p>
    <p>Thank you for your assistance,</p>
    <p>PassGeek</p>
</div>
