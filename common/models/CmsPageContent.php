<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "cms_page_content".
 *
 * @property integer $id
 * @property string $content
 * @property integer $page_id
 * @property string $name
 *
 * @property CmsPage $page
 */
class CmsPageContent extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cms_page_content';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['page_id'], 'required'],
            [['page_id'], 'integer'],
            [['content'], 'string'],
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
            'content' => 'Content',
            'page_id' => 'Page ID',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getPage()
    {
        return $this->hasOne(CmsPage::className(), ['id' => 'page_id']);
    }
}
