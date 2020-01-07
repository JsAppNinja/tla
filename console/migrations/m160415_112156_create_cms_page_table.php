<?php

use yii\db\Schema;
use yii\db\Migration;

class m160415_112156_create_cms_page_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%cms_page}}', [
            'id' => $this->primaryKey(),
            'title' => $this->string(),
            'name' => $this->string()
        ], $tableOptions);
    }

    public function down()
    {
        $this->dropTable('{{%cms_page}}');
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
