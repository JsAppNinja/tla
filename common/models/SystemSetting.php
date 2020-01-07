<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "system_setting".
 *
 * @property integer $amount_per_student
 * @property integer $student_monthly_amount
 * @property integer $recurring_period
 */
class SystemSetting extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'system_setting';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['amount_per_student', 'student_monthly_amount', 'recurring_period', 'payment_enabled'], 'integer']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'amount_per_student' => 'Amount Per Student',
            'student_monthly_amount' => 'Student Monthly Amount',
            'recurring_period' => 'Recurring Period',
        ];
    }

    public static function student_monthly_amount()
    {
        return SystemSetting::find()->all()[0]->student_monthly_amount;
    }

    public static function amount_per_student()
    {
        return SystemSetting::find()->all()[0]->amount_per_student;
    }

    public static function payment_enabled()
    {
        return SystemSetting::find()->all()[0]->payment_enabled;
    }
    public static function without_pending()
    {
        return SystemSetting::find()->all()[0]->without_pending;
    }
}
