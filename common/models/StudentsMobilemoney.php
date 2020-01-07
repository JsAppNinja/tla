<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "students_mobilemoney".
 *
 * @property integer $id
 * @property integer $currency_id
 * @property double $price
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property MmCountry $currency
 */
class StudentsMobilemoney extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'students_mobilemoney';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['currency_id'], 'required'],
            [['currency_id', 'created_at', 'updated_at'], 'integer'],
            [['price'], 'number']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'currency_id' => 'Currency ID',
            'price' => 'Price',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCurrency()
    {
        return $this->hasOne(MmCountry::className(), ['id' => 'currency_id']);
    }
}
