<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "cms_page".
 *
 * @property integer $id
 * @property string $title
 * @property string $name
 *
 * @property CmsPageContent[] $cmsPageContents
 */
class CmsPage extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cms_page';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['title', 'name'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'title' => 'Title',
            'name' => 'Name',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCmsPageContents()
    {
        return $this->hasMany(CmsPageContent::className(), ['page_id' => 'id']);
    }
}
