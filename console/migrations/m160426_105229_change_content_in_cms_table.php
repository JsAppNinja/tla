<?php

use yii\db\Schema;
use yii\db\Migration;

class m160426_105229_change_content_in_cms_table extends Migration
{
    public function up()
    {
        $this->dropColumn('{{%cms_page_content}}', 'content');
        $this->addColumn('{{%cms_page_content}}', 'content', $this->text());
    }

    public function down()
    {
        $this->dropColumn('{{%cms_page_content}}', 'content');
        $this->addColumn('{{%cms_page_content}}', 'content', $this->string());
    }

    /*
    // Use safeUp/safeDown to run migration code within a transaction
    public function safeUp()
    {
    }

    public function safeDown()
    {
    }
    */
}
