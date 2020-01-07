<?php

use yii\db\Schema;
use yii\db\Migration;

class m160303_113622_add_hash_field_to_user_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%user}}', 'hash', 'string');
    }

    public function down()
    {
        $this->dropColumn('{{%user}}', 'hash');
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
