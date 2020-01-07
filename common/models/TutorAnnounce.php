<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "tutor_announce".
 *
 * @property integer $id
 * @property integer $tutor_id
 * @property integer $status
 * @property string $text
 * @property string $date
 *
 * @property Tutor $tutor
 */
class TutorAnnounce extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'tutor_announce';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['tutor_id'], 'required'],
            [['tutor_id', 'status'], 'integer'],
            [['text'], 'string'],
            [['date'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'tutor_id' => 'Tutor ID',
            'status' => 'Status',
            'text' => 'Text',
            'date' => 'Date',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTutor()
    {
        return $this->hasOne(Tutor::className(), ['id' => 'tutor_id']);
    }
}
