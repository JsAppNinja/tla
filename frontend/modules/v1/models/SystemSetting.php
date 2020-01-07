<?php

namespace frontend\modules\v1\models;

use Yii;

class SystemSetting extends \common\models\SystemSetting
{
    public function fields()
    {
        return [
            'amount_per_student',
            'student_monthly_amount',
            'recurring_period',
            'payment_enabled'
        ];
    }
}