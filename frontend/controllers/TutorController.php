<?php

namespace frontend\controllers;

use common\models\Billing;
use common\models\Quize;
use common\models\Quizpractice;
use common\models\Subscription;
use common\models\SystemSetting;
use common\models\Tutor;
use common\models\User;
use Exception;
use frontend\modules\v1\models\SubscriptionPlan;
use yii;
use yii\data\ActiveDataProvider;
use yii\filters\VerbFilter;
use yii\helpers\Url;
use yii\web\Controller;

class TutorController extends Controller
{
    public $layout = 'tutor';

    public function behaviors()
    {
        return [
            'CheckDeactivated' => [
                'class' => 'common\behaviors\CheckDeactivated',
            ],
            'CheckSubscription' => [
                'class' => 'common\behaviors\CheckSubscription',
                'active' => true
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'finish-practice' => ['post']
                ]
            ]
        ];
    }

    public function actionIndex()
    {
        return $this->render('index');
    }

    public function init()
    {
        if (!Yii::$app->user->identity) {
            return $this->goHome();
        }

        parent::init();
    }

    public function actionDeactivated() {
        $this->layout = 'tutor_unsubscribe';
        return $this->render('deactivated');
    }

    public function actionSubscription()
    {
        $this->layout = 'tutor_unsubscribe';
        $model = SubscriptionPlan::find()->all();
        return $this->render('subscription', compact('model'));
    }

    public function actionBillingCycle()
    {
        $subscription = Yii::$app->user->identity->subscription;
        $provider = new ActiveDataProvider([
            'query' => Billing::find()->where(['subscription_id' => $subscription->id]),
            'pagination' => [
                'pageSize' => 2,
            ],
        ]);

        $billing = $provider->getModels();
        return $this->render('billing_cycle', compact('subscription', 'provider'));
    }

    public function actionChangePlan()
    {
        return $this->render('changePlan');
    }


    public function beforeAction($action)
    {
        $this->enableCsrfValidation = true;
        return parent::beforeAction($action);
    }

    public function actionStudentResult($id)
    {
//        $this->layout = 'tutorResult';
        $quizpractice = Quizpractice::findOne(['id' => $id]);
        $quizpractice->answers = json_decode($quizpractice->answers, true);
        $result = Quizpractice::checkAnswers($quizpractice->answers, $quizpractice->quiz->questions);
        $backUrl = [
            'url' => Url::toRoute('finished-quizzes'),
            'text' => 'Back to finished quizzes list'
        ];
        $this->view->params['breadcrumbs'] = [
            'links' => [
                'label' => 'Finished quiz result'
            ]
        ];

        $a = $this->render('/student/practiceExam/result', compact('result', 'quizpractice', 'backUrl'));

        return $a;
    }

}
