<?php

use yii\db\Schema;
use yii\db\Migration;

class m160415_112544_create_cms_page_content_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%cms_page_content}}', [
            'id' => $this->primaryKey(),
            'content' => $this->string(),
            'name' => $this->string(),
            'page_id' => $this->integer()->notNull()
        ], $tableOptions);

        $this->addForeignKey('fk_page_content', '{{%cms_page_content}}', 'page_id', '{{%cms_page}}', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%cms_page_content}}');
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
