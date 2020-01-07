<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "mm_country".
 *
 * @property integer $id
 * @property string $name
 * @property string $currency
 * @property string $phones
 */
class MmCountry extends \yii\db\ActiveRecord
{
    public $price = null;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'mm_country';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'currency', 'phones'], 'string', 'max' => 255]
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
            'currency' => 'Currency',
            'phones' => 'Phones',
        ];
    }
}
