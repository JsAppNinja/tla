<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "subject_origin".
 *
 * @property integer $id
 * @property string $name
 *
 * @property Subject[] $subjects
 */
class SubjectOrigin extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'subject_origin';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
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
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSubjects()
    {
        return $this->hasMany(Subject::className(), ['subject_origin_id' => 'id']);
    }
}
