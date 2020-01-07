<?php

use yii\db\Schema;
use yii\db\Migration;

class m170503_082115_add_created_at_to_billing extends Migration
{
    public function up()
    {
        $this->addColumn('{{%billing}}', 'created_at', $this->integer());
        $this->addColumn('{{%billing}}', 'updated_at', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%billing}}', 'created_at');
        $this->dropColumn('{{%billing}}', 'updated_at');

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
