<?php

use yii\db\Schema;
use yii\db\Migration;

class m160323_062238_add_first_last_name_fields_to_tutor_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%tutor}}', 'first_name', $this->string());
        $this->addColumn('{{%tutor}}', 'last_name', $this->string());
    }

    public function down()
    {
        $this->dropColumn('{{%tutor}}', 'first_name');
        $this->dropColumn('{{%tutor}}', 'last_name');
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
