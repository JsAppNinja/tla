<?php
namespace frontend\models;

use common\models\SystemSetting;
use Yii;
use yii\base\Model;
use common\models\User;
use yii\helpers\VarDumper;

class SendLinkForm extends Model
{
    public $email;
    public $userLink;
    public $user;
    public $student_monthly;

    public function init()
    {
        $this->userLink = Yii::$app->user->identity->getUserPaymentLink();
        $this->user = Yii::$app->user->identity;
        $this->student_monthly = SystemSetting::student_monthly_amount();
    }


    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['email', 'filter', 'filter' => 'trim'],
            [['email', 'userLink'], 'required'],
            ['email', 'email'],
            [['email', 'userLink'], 'string', 'max' => 255],
        ];
    }

    public function sendLink()
    {
        return Yii::$app->mailer->compose(['html' => 'studentLink'], ['model' => $this])
            ->setFrom([Yii::$app->components['mailer']['transport']['username'] => 'PassGeek.com'])
            ->setTo($this->email)
            ->setSubject('PassGeek.com')
            ->send();
    }
}
