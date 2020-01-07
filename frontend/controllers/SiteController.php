<?php
namespace frontend\controllers;

use common\models\Exam;
use common\models\UploadExamForm;
use common\models\User;
use Exception;
use frontend\components\Helpers\MixPanelHelper;
use frontend\models\EmailForm;
use frontend\models\UserSignupForm;
use frontend\modules\v1\models\CmsPage;
use Mixpanel;
use PayPal\Api\Amount;
use \PayPal\Api\CreditCard;

use PayPal\Api\Details;
use PayPal\Api\FundingInstrument;
use PayPal\Api\Item;
use PayPal\Api\ItemList;
use PayPal\Api\Payer;
use PayPal\Api\Payment;
use PayPal\Api\Transaction;
use PayPal\Exception\PayPalConnectionException;
use Yii;
use common\models\LoginForm;
use frontend\models\PasswordResetRequestForm;
use frontend\models\ResetPasswordForm;
use frontend\models\SignupForm;
use frontend\models\ContactForm;
use yii\base\InvalidParamException;
use yii\bootstrap\ActiveForm;
use yii\helpers\VarDumper;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use yii\web\ForbiddenHttpException;
use yii\web\Response;
use yii\web\UploadedFile;


/**
 * Site controller
 */
class SiteController extends Controller
{

    public $layout = 'newLayout';

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['signup'],
                'rules' => [
                    [
                        'actions' => ['signup'],
                        'allow' => true,
                        'roles' => ['?'],
                    ],
                ],
            ],
        ];
    }



    /**
     * @inheritdoc
     */
    public function actions()
    {
        return [
            'error' => [
                'class' => 'yii\web\ErrorAction',
            ],
            'captcha' => [
                'class' => 'yii\captcha\CaptchaAction',
                'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
            ],

            'auth' => [
                'class' => 'yii\authclient\AuthAction',
                'successCallback' => [$this, 'successCallback'],
            ],
        ];
    }

    protected function setViewParams($com)
    {

    }

    public function actionTest()
    {
        if (Yii::$app->request->isAjax) {

            return $this->redirect('/signup');
        }
    }

    public function init()
    {
        $login = new LoginForm();
        if ($login->load(Yii::$app->request->post()) && $login->login()) {
            return $this->goBack();
        }

        $contact = new ContactForm();

        if (!isset($this->view->params['login'])) $this->view->params['login'] = $login;
        if (!isset($this->view->params['contact'])) $this->view->params['contact'] = $contact;

        $this->view->params['numberOfTeachers'] = User::getNumberOfTeachers();
        $this->view->params['numberOfStudents'] = User::getNumberOfStudents();
        $this->view->params['numberOfSchools'] = User::getNumberOfSchools();

        return parent::init();
    }

    /**
     * Displays homepage.
     *
     * @return mixed
     */
    public function actionIndex()
    {

        if (User::isTeacher()) {
            return $this->redirect(['/tutor/']);
        }
        if (User::isAdmin() || User::isPureAdmin()) {
            return $this->redirect(['/manage/']);
        }
        if (User::isStudent()) {
            return $this->redirect(['/student/practice-exam']);
        }
        $this->view->params['title'] = "Home page";


        $blocks = CmsPage::find()->where(['name' => 'landing_page'])->one()->cmsPageContents;
        return $this->render('index', compact('blocks'));
    }

    public function actionSendContact()
    {
        if (Yii::$app->request->isPost) {
            $contact = new ContactForm();
            $request = Yii::$app->request;
            $contact->load($request->getBodyParams());
            $email = Yii::$app->params['adminEmail'];
            $contact->sendEmail($email);
        }

        return $this->redirect('/');
    }

    /**
     * Exams route
     */
    public function actionExams()
    {
        $this->view->params['title'] = "Exams";
        $this->view->params['breadcrumbs'] = [
            'links' => [
                'label' => 'Exams'
            ]
        ];
        return $this->render('exams');
    }

    /**
     * Logs in a user.
     *
     * @return mixed
     */
    public function actionLogin()
    {
        $model = new LoginForm();

        if (Yii::$app->request->isAjax && $model->load(Yii::$app->request->post())) {
            Yii::$app->response->format = Response::FORMAT_JSON;
            return ActiveForm::validate($model);
        }

        if (!\Yii::$app->user->isGuest) {
            return $this->goHome();
        }

        if ($model->load(Yii::$app->request->post()) && $model->login()) {
            if(Yii::$app->user->delete_time) {
                Yii::$app->user->logout();
            }
            return $this->goBack();
        } else {
            return $model->errors;
        }
    }

    /**
     * Logs out the current user.
     *
     * @return mixed
     */
    public function actionLogout()
    {
        if (!Yii::$app->user->isGuest) {
            Yii::$app->user->logout();
        }
        return $this->goHome();
    }

    /**
     * Displays contact page.
     *
     * @return mixed
     */
    public function actionContact()
    {
        $model = new ContactForm;
        if (Yii::$app->request->isPost) {
            $request = Yii::$app->request;
            $model->load($request->getBodyParams());
            $email = Yii::$app->params['adminEmail'];
            if ($model->sendEmail($email)) {
                Yii::$app->session->setFlash('success', 'Your feedback was sent !');
            }
        }
        return $this->render('contact', compact('model'));
    }

    /**
     * Displays about page.
     *
     * @return mixed
     */
    public function actionAbout()
    {
        $this->view->params['title'] = "About";
        $this->view->params['breadcrumbs'] = [
            'links' => [
                'label' => 'About'
            ]
        ];
        return $this->render('about');
    }

    public function actionDisclosure()
    {
        $this->view->params['title'] = "Disclosure";
        $this->view->params['breadcrumbs'] = [
            'links' => [
                'label' => 'Disclosure'
            ]
        ];
        return $this->render('disclosure');
    }

    public function actionTerms()
    {
        $this->view->params['title'] = "Terms";
        $this->view->params['breadcrumbs'] = [
            'links' => [
                'label' => 'Terms'
            ]
        ];
        return $this->render('terms');
    }

    public function actionTestimonials()
    {
        $this->view->params['title'] = "Testimonials";
        $this->view->params['breadcrumbs'] = [
            'links' => [
                'label' => 'Testimonials'
            ]
        ];
        return $this->render('testimonials');
    }

    public function actionExam()
    {
        if (!User::isTeacher()) {
            throw new ForbiddenHttpException();
        };

        $uploadExam = new UploadExamForm();

        if (Yii::$app->request->isPost) {
            $uploadExam->examFile = UploadedFile::getInstance($uploadExam, 'examFile');
            if ($uploadExam->validate()) {
                if ($uploadExam->createExam(Yii::$app->user->identity->getId())) {
                    Yii::$app->session->setFlash('success', 'Uploading was successful');
                } else {
                    Yii::$app->session->setFlash('error', 'An error occurred');
                }
            }
        }

        return $this->render('exam', [
            'uploadExam' => $uploadExam,
        ]);

    }

    /**
     * Signs user up.
     *
     * @return mixed
     */
    public function actionSignup()
    {
        $model = new UserSignupForm();
//        $model->firstName = Yii::$app->request->get('firstName');
//        $model->lastName = Yii::$app->request->get('lastName');
//        $email = new EmailForm();
//        $email->email = Yii::$app->request->get('email');
//
//        $socialId = Yii::$app->request->get('socialId');
//        $emailAddress = null;
//
//        if (!$email->validate()) {
//            if (empty($socialId)) {
//                return $this->goHome();
//            }
//        } else {
//            $emailAddress = $email->email;
//        }
//
//
//        if ($model->load(Yii::$app->request->post())) {
//            if ($model->validate()) {
//                if ($model->signUpUser($emailAddress, $socialId)) {
//                    if (User::isTeacher()) {
//                        return $this->redirect(['/manage/']);
//                    } else {
//                        return $this->goHome();
//                    }
//                };
//            }
//        }

        if (Yii::$app->request->isPost) {
            $model->load(Yii::$app->request->post());
            if ($model->validate()) {
                if ($model->signUpUser()) {
                    $this->goHome();
                }
            }
        }

        $this->view->params['title'] = "SignUp";

        return $this->render('signup', [
            'model' => $model,
        ]);
    }

    /**
     * Requests password reset.
     *
     * @return mixed
     */
    public function actionRequestPasswordReset()
    {

        $model = new PasswordResetRequestForm();
        if ($model->load(Yii::$app->request->post()) && $model->validate()) {
            if ($model->sendEmail()) {
                Yii::$app->session->setFlash('success', 'Check your email for further instructions.');

                return $this->goHome();
            } else {
                Yii::$app->session->setFlash('error', 'Sorry, we are unable to reset password for email provided.');
            }
        }

        return $this->render('requestPasswordResetToken', [
            'model' => $model,
        ]);
    }

    /**
     * Resets password.
     *
     * @param string $token
     * @return mixed
     * @throws BadRequestHttpException
     */
    public function actionResetPassword($token)
    {
        try {
            $model = new ResetPasswordForm($token);
        } catch (InvalidParamException $e) {
            throw new BadRequestHttpException($e->getMessage());
        }

        if ($model->load(Yii::$app->request->post()) && $model->validate() && $model->resetPassword()) {
            Yii::$app->session->setFlash('success', 'New password was saved.');

            return $this->redirect(['index']);
        }

        return $this->render('resetPassword', [
            'model' => $model,
        ]);
    }

    public function beforeAction($action)
    {
        if(Yii::$app->user->isGuest) {
            $mp = new MixPanelHelper();
            $mp->track('Public page view');
        }

        if (parent::beforeAction($action)) {
            // change layout for error action
            if ($action->id == 'error')
                $this->layout = 'error';
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param \yii\authclient\OAuth2 $client
     */
    public function successCallback($client)
    {
        $attributes = $client->getUserAttributes();
        $socialId = $firstName = $lastName = $email = null;
        $auth_data = [];
        if ($client instanceof \yii\authclient\clients\Facebook) {
            try {
                $auth_data['social_id'] = $attributes['id'];
                if ($user = User::findBySocialId($attributes['id'])) {
                    if (Yii::$app->user->login($user, 3600 * 24 * 30)) {
                        return $this->goHome();
                    };
                };

                $auth_data['firstName'] = $attributes['first_name'];
                $auth_data['lastName'] = $attributes['last_name'];
            } catch (\Exception $e) {
            };
        }

        if ($client instanceof \yii\authclient\clients\Twitter) {
            try {
                $auth_data['social_id'] = $attributes['id'];
                if ($user = User::findBySocialId($attributes['id'])) {
                    if (Yii::$app->user->login($user, 3600 * 24 * 30)) {
                        return $this->goHome();
                    };
                };
                $fullName = explode(' ', $attributes['name']);
                if (!empty($fullName[0])) {
                    $auth_data['firstName'] = $fullName[0];
                }
                if (!empty($fullName[1])) {
                    $auth_data['lastName'] = $fullName[1];
                }

            } catch (\Exception $e) {
            };
        }

        if (!empty($attributes['email']) && !User::findByEmail($attributes['email'])) {
            $auth_data['email'] = $attributes['email'];
        };
        $this->view->params['auth_data'] = $auth_data;
        return $this->redirect([
            'site/signup',
            'data'=>$auth_data
        ]);
    }
}
