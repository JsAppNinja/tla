<?php

namespace common\models;

use frontend\modules\v1\models\MmCountry;
use Yii;
use yii\helpers\VarDumper;

/**
 * This is the model class for table "subscription_plan".
 *
 * @property integer $id
 * @property string $name
 * @property integer $students_count
 * @property float $amount
 * @property string $description
 */
class SubscriptionPlan extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'subscription_plan';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['students_count'], 'integer'],
            [['amount'], 'number'],
            [['description'], 'string'],
            [['name'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'students_count' => 'Students Count',
            'description' => 'Description',
        ];
    }
}
