<?php

use common\widgets\Alert;
use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use common\models\User;
use yii\helpers\Url;

/* @var $this yii\web\View */

$this->title = 'Training/Learning application';
$contact = $this->params['contact'];

?>

<section class="container-fluid blue-bg" id="videoAndSample" style="position: relative;">
    <div class="container">
        <div class="row">
            <div class="col-md-12 visible-xs-block" ng-controller="FreepracticeListControllerXs">
                <div class="row">
                    <div class="col-md-3" ng-repeat="exam_type in exam_types track by $index">
                        <div class="form-group">
                            <button ng-class="{active: !exam_type.active}" ng-click="showExam(exam_type)"
                                    style="font-size: 20px;padding: 8px 15px;line-height: 24px;"
                                    class="btn button-big"><span class="lead"><strong>{{exam_type.name}}</strong></span><br> <span>Try
                        over 20000 free past questions and videos</span> <br> <u>Click here</u></button>
                        </div>
                    </div>
                </div>
                <div class="row tryOutXs" id="tryOut">
                    <div class="col-md-12">
                        <ul class="nav nav-tabs">
                            <li class="active"><a data-toggle="tab" href="#qa">Sample Q/A</a></li>
                            <li><a data-toggle="tab" href="#videos">Sample videos</a></li>
                        </ul>

                        <div class="tab-content">
                            <div id="qa" class="tab-pane fade in active">
                                <div class="row container_for_group">
                                    <div class="form-group col-xs-12 col-md-6">
                                        <label for="">Subject</label>
                                        <p style="color: red">Please select a subject from drop down below</p>
                                        <select ng-options="subject.name for subject in subjects"
                                                ng-model="selectedSubject"
                                                class="form-control"></select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xs-12">
                                        <h1 ng-hide="exams.length" class="ng-hide">No Exams found ...</h1>
                                        <table class="ng-cloak styled">
                                            <tr ng-repeat="exam in exams track by $index">
                                                <td>
                                                    {{exam.name}}
                                                </td>
                                                <td class="start-button">
                                                    <a ng-href="/freepractice/practice/{{exam.id}}"
                                                       class="btn btn-primary pull-right">
                                    <span>
                                        Start
                                    </span>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div id="videos" class="tab-pane fade">
                                <div class="row">
                                    <div class="form-group col-xs-12 col-md-6">
                                        <label for="">Subject</label>
                                        <p style="color: red">Please select a subject from drop down below</p>
                                        <ui-select ng-model="selectedVideosSubject.value"
                                                   on-select="onVideoSubjectSelect($item)">
                                            <ui-select-match placeholder="Select subject" allow-clear="true">
                                                    <span
                                                        ng-bind="$select.selected.name"></span>
                                            </ui-select-match>
                                            <ui-select-choices
                                                repeat="subject in (videosSubjects | filter: $select.search) track by subject.id">
                                            <span
                                                ng-bind-html="subject.name | highlight: $select.search"></span>
                                            </ui-select-choices>
                                        </ui-select>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-8 free-video__item" ng-repeat="video in videos track by $index">
                                        <div class="row clearfix">
                                            <div class="col-md-9">
                                                <h4>{{video.title}}</h4>
                                            </div>
                                            <div class="col-md-3 text-right">
                                                <h4>{{video.subject.name}}</h4>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-3">
                                                <img class="img-responsive" src="{{video.preview_img}}" alt="...">
                                            </div>
                                            <div class="col-md-7">
                                                {{video.description}}
                                            </div>
                                            <div class="col-md-2 viewVideoButton text-right">
                                                <button class="btn btn-primary" ng-click="showVideo(video)">View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-12">
                <div class="row">
                    <div class="col-md-3">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="panel panel-default">
                                    <div class="panel-body text-center">
                                        <?= $blocks[0]['content'] ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="panel panel-default">
                                    <div class="panel-body text-center">
                                        <?= $blocks[1]['content'] ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group">
                                    <div class="embed-responsive embed-responsive-16by9">
                                        <iframe class="embed-responsive-item"
                                                src="https://www.youtube.com/embed/Gknjta4dPkg?rel=0&amp;showinfo=0"></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="panel panel-default">
                                    <div class="panel-body text-center">
                                        <?= $blocks[2]['content'] ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="panel panel-default">
                                    <div class="panel-body text-center">
                                        <?= $blocks[3]['content'] ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-12 hidden-xs" id="sampleQA" ng-controller="FreepracticeListController">
                <div class="row">
                    <div class="col-md-3" ng-repeat="exam_type in exam_types track by $index">
                        <div class="form-group">
                            <button ng-class="{active: !exam_type.active}" ng-click="showExam(exam_type)"
                                    style="font-size: 20px;padding: 8px 15px;line-height: 24px;"
                                    class="btn button-big"><span class="lead"><strong>{{exam_type.name}}</strong></span><br> <span>Try
                        over 20000 free past questions and videos</span> <br> <u>Click here</u></button>
                        </div>
                    </div>
                </div>
                <div class="row tryOut" id="tryOut">
                    <div class="col-md-12">
                        <ul class="nav nav-tabs" id="tabMd">
                            <li class="active"><a href="#qaMd">Sample Q/A</a></li>
                            <li><a href="#videosMd">Sample videos</a></li>
                        </ul>

                        <div class="tab-content">
                            <div id="qaMd" class="tab-pane fade in active">
                                <div class="row container_for_group">
                                    <div class="form-group col-xs-12 col-md-6">
                                        <label for="">Subject</label>
                                        <p style="color: red">Please select a subject from drop down below</p>
                                        <select ng-options="subject.name for subject in subjects"
                                                ng-model="selectedSubject"
                                                class="form-control"></select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xs-12">
                                        <h1 ng-hide="exams.length" class="ng-hide">No Exams found ...</h1>
                                        <table class="ng-cloak styled">
                                            <tr ng-repeat="exam in exams track by $index">
                                                <td>
                                                    {{exam.name}}
                                                </td>
                                                <td class="start-button">
                                                    <a ng-href="/freepractice/practice/{{exam.id}}"
                                                       class="btn btn-primary pull-right">
                                    <span>
                                        Start
                                    </span>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div id="videosMd" class="tab-pane fade">
                                <div class="row">
                                    <div class="form-group col-xs-12 col-md-6">
                                        <label for="">Subject</label>
                                        <p style="color: red">Please select a subject from drop down below</p>
                                        <ui-select ng-model="selectedVideosSubject.value"
                                                   on-select="onVideoSubjectSelect($item)">
                                            <ui-select-match placeholder="Select subject" allow-clear="true">
                                                    <span
                                                        ng-bind="$select.selected.name"></span>
                                            </ui-select-match>
                                            <ui-select-choices
                                                repeat="subject in (videosSubjects | filter: $select.search) track by subject.id">
                                            <span
                                                ng-bind-html="subject.name | highlight: $select.search"></span>
                                            </ui-select-choices>
                                        </ui-select>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-8 free-video__item" ng-repeat="video in videos track by $index">
                                        <div class="row clearfix">
                                            <div class="col-md-9">
                                                <h4>{{video.title}}</h4>
                                            </div>
                                            <div class="col-md-3 text-right">
                                                <h4>{{video.subject.name}}</h4>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-3">
                                                <img class="img-responsive" src="{{video.preview_img}}" alt="...">
                                            </div>
                                            <div class="col-md-7">
                                                {{video.description}}
                                            </div>
                                            <div class="col-md-2 viewVideoButton text-right">
                                                <button class="btn btn-primary" ng-click="showVideo(video)">View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>


<section class="container-fluid blue-bg" id="usersCount">
    <div class="container">
        <div class="row">
            <div class="col-md-12 text-center">
                <span class="userCount__title"></span>
                <p class="userCount__userType">Number of visitors</p>
                <span class="userCount__count"><?php echo Yii::$app->userCounter->getTotal() + 371 ?></span>
            </div>
        </div>
    </div>
</section>

<section class="container-fluid" id="about">
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1 class="title">About Us</h1>

                <p>Every student wants to understand the principles taught in school on various subjects as well as
                    how
                    to apply them to solve and answer questions correctly in exams in order to pass. PassGeek
                    provides a
                    platform that allows students to learn subjects through video tutoring by using modern
                    technology at
                    the click of a button. It provides a general overview of a subject and its various topics, and
                    extensive exam questions to assess the students’ understanding of the topics. In addition,
                    PassGeek
                    provides the opportunity for students to connect with their peers, successful tutors, or join an
                    online school. The online school provides the same syllabuses in all the courses as a brick and
                    mortar schools. However students gain the flexibility to learn at their own pace without the
                    unnecessary disruptions that occur in brick and mortar schools, such as strikes and
                    demonstrations,
                    as well as natural disasters. Below is a summary of some of the benefits from using
                    PassGeek.</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-3">
                <div class="text-center">
                    <div class="circle"><img src="/temporary/images/students.png"></div>
                    <span class="circle-title">Students</span>
                </div>
                <ol>
                    <li>View overview videos that
                        explains concepts and topics
                    </li>
                    </br>
                    <li> Practice past questions on
                        different subjects
                    </li>
                    </br>
                    <li> Get report on subject or topic
                        area of challenge
                    </li>
                    </br>
                    <li> View solution videos that
                        explain the “How” to solution
                        a problem
                    </li>
                    </br>
                    <li>Search for and get training
                        from a tutors specialized in a
                        subject on this platform
                    </li>
                    </br>
                    <li> Search for and join a school,
                        to attend classes remotely on
                        this platform
                    </li>
                </ol>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <div class="circle"><img src="/temporary/images/tutors.png"></div>
                    <span class="circle-title">Tutors</span>
                </div>
                <ol>
                    <li>Setup your classroom online
                        with all your training
                        materials one time
                    </li>
                    </br>
                    <li>Re-use materials to train
                        students, no need to reinvent
                        the wheel, just update
                    </li>
                    </br>
                    <li>Set up specific grade/
                        classroom levels based on
                        subjects/courses
                    </li>
                    </br>
                    <li>Get traffic to your class from
                        registered/referred students
                    </li>
                    </br>
                    <li>Get paid for delivering your
                        services remotely without
                        travel or other cost
                        associated with renting space
                    </li>
                    </br>
                    <li>Maintain access control on
                        your materials
                    </li>
                    </br>
                    <li>Get ratings from students
                        based on your performance
                    </li>
                </ol>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <div class="circle"><img src="/temporary/images/schools.png"></div>
                    <span class="circle-title">Schools</span>
                </div>
                <ol>
                    <li>Setup your school online with
                        all your training materials
                        one time
                    </li>
                    </br>
                    <li>Search for and select
                        teachers from the list of
                        online teachers or invite your
                        own teachers as part of your
                        registered school
                    </li>
                    </br>
                    <li>Set up specific grade/
                        classroom levels based on
                        subjects/courses for your
                        school
                    </li>
                    </br>
                    <li>Get traffic to your school
                        through advertising your
                        school to students and
                        parents online
                    </li>
                    </br>
                    <li>Get paid for delivering your
                        services remotely without
                        travel or other cost
                        associated with renting space
                    </li>
                    </br>
                    <li> Maintain and manage access
                        control on school materials
                    </li>
                    </br>
                    <li>Get ratings from students
                        based on your performance
                        to showcase your school
                    </li>
                </ol>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <div class="circle"><img src="/temporary/images/parents.png"></div>
                    <span class="circle-title">Parents</span>
                </div>
                <ol>
                    <li>Sign-up to get reports on
                        your child’s progress and
                        performance on a weekly
                        basis
                    </li>
                    </br>
                    <li>Assist your child in selecting a
                        teacher online from the list
                        of teachers available
                    </li>
                    </br>
                    <li>Assist your child in selecting a
                        registered school online from
                        the list of schools available
                    </li>
                    </br>
                    <li>No need to worry about
                        disruption of your child’s
                        academic pursuit caused by
                        strikes, demonstrations, etc.
                    </li>
                </ol>
            </div>
        </div>
        <div class="row">
            <div class="col-md-3">
            </div>
            <div class="col-md-3">

            </div>
            <div class="col-md-3">

            </div>
            <div class="col-md-3">

            </div>
        </div>
    </div>
</section>

<section class="container-fluid blue-bg" id="terms">
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="terms_shell">
                    <h1 class="title">Terms of Use</h1>
                    <span>Definitions</span>

                    <div class="shell-for-text">
                        <div class="col-md-4"><p><span>Student</span> - A person who takes an interest in a particular
                                subject,
                                studying, or willing to study in order to pass exams or enter into a profession.</p>
                        </div>
                        <div class="col-md-4"><p><span>Tutor</span> - A private teacher, instructor, educator, lecturer,
                                trainer or
                                mentor. Typically one who teaches a single student or a group of students.</p></div>
                        <div class="col-md-4"><p><span>Parent</span>- A caretaker of a student who uses this site.</p>
                        </div>
                    </div>
                    <div class="terms_text">
                        <p>Please read these carefully, if users do not wish to be bound by this agreement, do not use
                            this
                            site.</p>

                        <p>The following terms and conditions are binding between the user and PassGeek.com. By using
                            this site, or
                            by
                            registering and creating an account, the user agrees to be bound by and comply with the site
                            usage
                            agreement set
                            forth below.</p>

                        <p>The user must:</p>
                        <ol>
                            <li>Use this learning platform only for the purpose of personal learning or providing
                                learning to
                                students.
                            </li>
                            <li>Treat all other users with respect and exercise civility in his/her communication with
                                others.
                            </li>
                            <li>Protect their personal information and not volunteer sensitive information to unknown
                                users.
                            </li>
                        </ol>

                        <p>Unless authorized, users may not:</p>
                        <ol>
                            <li>Engage in any communication or display of images or texts on this site that are
                                considered obscene,
                                lewd,
                                lascivious, filthy, violent, harassing, defamatory, libelous, tortious, illegal,
                                threatening,
                                discriminatory
                                or otherwise objectionable.
                            </li>
                            <li>Meet up in person with any other users or put themselves at risk by providing their
                                location or
                                contact
                                address to other users.
                            </li>
                            <li>Engage in any personal or business marketing or advertisement on this site except
                                authorized by
                                PassGeek.com.
                            </li>
                            <li>Deep link or employ software or any automatic device, technology or algorithm, to
                                "crawl," "scrape,"
                                "search," or monitor this site, or retrieve or copy content or related information.
                            </li>
                            <li>Violate the mechanical restrictions of this site, or bypass other measures employed to
                                prevent or
                                limit
                                access to this site or content by hacking or other means.
                            </li>
                            <li>Copy, redirect, or exploit or any content on this site.</li>
                            <li>Probe, scan or test the vulnerability of the site or the network supporting the site, or
                                seek
                                information on
                                visitors or members to this site or personal information of its users.
                            </li>
                            <li>Use any device or software that would interfere with the proper functioning of this site
                                or any
                                communication conducted via this site.
                            </li>
                        </ol>
                        <h3>Disclaimer</h3>
                        <ul>
                            <li>The material and resources on this site are provided to users as they are, and PassGeek
                                provides no
                                warranties of any sort to users for utilizing the site. PassGeek will not be liable for
                                the use of
                                this
                                site, its materials and resources by any user.
                            </li>
                        </ul>
                        <h3>Copyright and Trademark Information</h3>
                        <ul>
                            <li>All trademarks, including logos, and trade names are proprietary to PassGeek.com, All
                                electronic
                                content,
                                including logos, images and site features are the property of PassGeek.com. Users may
                                not download,
                                modify,
                                redistribute or use the content of this site in any form without the written consent of
                                PassGeek.com. To
                                obtain permission, please email info@PassGeek.com
                            </li>
                        </ul>
                        <h3>Information Sharing</h3>
                        <ul>
                            <li>Any abuse of the use of PassGeek.com learning platform including, but not limited to,
                                the sharing of
                                passwords/access codes or the distribution of training materials to other organizations
                                will result
                                in the
                                loss of use of PassGeek.com learning platform and other criminal liabilities.
                            </li>
                        </ul>
                        <h3>Link Information</h3>
                        <ul>
                            <li>PassGeek.com provides users with the permission to link to our learning platform site
                                with the
                                following
                                stipulations:
                            </li>
                            <li>Links must be direct to PassGeek.com.</li>
                            <li>Link must not be commercialized.</li>
                        </ul>
                        <h3>Uploading Files</h3>
                        <ul>
                            <li>All contents uploaded is the sole responsibility of the user from whom the content as
                                originated.
                            </li>
                            <li>Users may not upload content that violates trademark, copyright, privacy or any other
                                rights of any
                                other
                                person.
                            </li>
                            <li>Users may not upload content that contains offensive or obscene material, or content
                                that could give
                                rise to
                                any civil or criminal liability under applicable law or regulations.
                            </li>
                            <li>PassGeek.com is in no way responsible for users’ documents. It is the responsibility of
                                users to
                                maintain
                                backup copies of all uploaded material. Should users choose to no longer be an active
                                client of
                                PassGeek.com, the files will be retained by PassGeek.com until such a time as deemed fit
                                for
                                destruction.
                            </li>
                            <li>Users will not knowingly upload any content containing viruses or malicious code.</li>
                            <li>Users will not intentionally go over their allowed storage limit.</li>
                            <li>PassGeek.com reserves the right to terminate this feature at any time, and/or adjust
                                storage limits
                                without
                                the permission of users.
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="gradient"></div>
                <button class="btn"><span>Read More</span> <span class="arrow_down"></span></button>
                <img class="first hidden-sm hidden-xs" src="/temporary/images/15.png">
                <img class="second hidden-sm hidden-xs" src="/temporary/images/16.png">
                <img class="third hidden-sm hidden-xs" src="/temporary/images/20.png">
                <img class="fourth hidden-sm hidden-xs" src="/temporary/images/24.png">
            </div>
        </div>
    </div>
</section>
<section class="container-fluid" id="disclosure">
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="disclosure_shell">
                    <h1 class="title">Disclosure</h1>
                    <div class="disclosure_shel_for_text">
                        <ol>
                            <div class="col-md-6">
                                <li>PassGeek acknowledges and refers to the following for the use of past questions
                                    provided to
                                    students, in order to assist in their preparation for exams:
                                    <ul>
                                        <li>West African Examination Council – WAEC</li>
                                        <li>Joint Admission Matriculation Board - JAMB</li>
                                        <li>Cambridge International Examinations - CIE</li>
                                    </ul>
                                </li>
                            </div>
                            <div class="col-md-6">
                                <li>PassGeek acknowledges the people who provided the learning videos for students. In
                                    particular: Mathieu Moncalvo and Amanda Ingley.
                                </li>
                            </div>
                        </ol>

                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<section class="container-fluid" id="contacts">
    <div class="container">
        <div class="row">
            <div class="col-md-4 col-md-offset-4">
                <div class="contact_shell">
                    <h1 class="title">Contact Us</h1>

                    <p>To contact PassGeek, please complete the form below and submit.</p>

                    <div class="contacts_inputs">
                        <?php $form = ActiveForm::begin([
                            'id' => 'contact-form',
                            'action' => 'site/send-contact'
                        ]); ?>
                        <?= $form->field($contact, 'firstName')->textInput(['placeholder' => 'First name', 'class' => 'form-control'])->label(false); ?>
                        <?= $form->field($contact, 'middleName')->textInput(['placeholder' => 'Middle name', 'class' => 'form-control'])->label(false); ?>
                        <?= $form->field($contact, 'lastName')->textInput(['placeholder' => 'Last name', 'class' => 'form-control'])->label(false); ?>
                        <?= $form->field($contact, 'country')->textInput(['placeholder' => 'Country of residence', 'class' => 'form-control'])->label(false); ?>
                        <?= $form->field($contact, 'email')->textInput(['placeholder' => 'E-mail', 'class' => 'form-control'])->label(false); ?>
                        <?= $form->field($contact, 'phone')->textInput(['placeholder' => 'Phone', 'class' => 'form-control'])->label(false); ?>
                        <?= $form->field($contact, 'reason')->dropDownList($contact->reasons)->label(false); ?>
                        <?= $form->field($contact, 'text')->textarea(['rows' => '6', 'placeholder' => 'Leave Comment', 'class' => 'form-control'])->label(false); ?>
                        <?= Html::submitButton('Send', ['class' => 'btn button-big']) ?>
                        <?php $form->end(); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>