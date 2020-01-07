<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "images".
 *
 * @property integer $id
 * @property string $name
 * @property string $path
 * @property integer $imageable_type
 * @property integer $imageable_id
 */
class Images extends \yii\db\ActiveRecord
{

    const QUESTION = 1;
    const SECTION = 2;
    const ESSAY = 3;
    const AVATAR = 4;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'images';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'imageable_type', 'imageable_id', 'path'], 'required'],
            [['imageable_type'], 'integer'],
            [['imageable_id'], 'integer'],
            [['path'], 'string', 'max' => 255],
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
            'path' => 'Path',
            'imageable_type' => 'Imageable Type',
            'imageable_id' => 'Imageable ID',
        ];
    }
}
