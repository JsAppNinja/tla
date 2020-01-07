<?php

namespace frontend\models;

use Yii;
use yii\base\Model;

/**
 * ContactForm is the model behind the contact form.
 */
class ContactForm extends Model
{
    public $firstName;
    public $middleName;
    public $lastName;
    public $country;
    public $email;
    public $phone;
    public $reason;
    public $text;
    public $verifyCode;

    public $reasons = [
        'Provide Feedback',
        'Make a Request',
        'Provide Information',
        'Business',
        'Sponsorship',
        'Accounts',
        'Report Misuse'
    ];

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            // name, email, subject and body are required
            [['firstName', 'lastName', 'reason', 'email'], 'required'],
            [['middleName', 'text', 'country', 'phone'], 'string'],
            // email has to be a valid email address
            ['email', 'email'],
            // verifyCode needs to be entered correctly
            ['verifyCode', 'captcha'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'verifyCode' => 'Verification Code',
        ];
    }

    /**
     * Sends an email to the specified email address using the information collected by this model.
     *
     * @param  string  $email the target email address
     * @return boolean whether the email was sent
     */
    public function sendEmail($email)
    {
        $status = Yii::$app->mailer->compose(['html' => 'contactUs'], ['model' => $this])
            ->setFrom([Yii::$app->components['mailer']['transport']['username'] => 'PassGeek.com'])
            ->setTo($email)
            ->setSubject('Feedback from PassGeek.com')
            ->send();
        if ($status) {
            Yii::$app->session->setFlash('success', 'Your feedback was sent !');
        } else {
            Yii::$app->session->setFlash('error', 'Error !');
        }
    }
}
