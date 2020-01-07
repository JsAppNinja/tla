<?php

use yii\db\Schema;
use yii\db\Migration;

class m161118_081038_AddDeleteTimeToUser extends Migration
{
    public function up()
    {
        $this->addColumn('{{%user}}', 'delete_time', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%user}}', 'delete_time');
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
