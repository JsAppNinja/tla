<?php

use yii\db\Schema;
use yii\db\Migration;

class m160420_062943_rename_table_chat extends Migration
{
    public function up()
    {
        $this->renameTable('{{%chat}}', 'old_chat');
    }

    public function down()
    {
        $this->renameTable('old_chat', '{{%chat}}');
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
