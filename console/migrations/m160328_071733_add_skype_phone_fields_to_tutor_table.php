<?php

use yii\db\Schema;
use yii\db\Migration;

class m160328_071733_add_skype_phone_fields_to_tutor_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%tutor}}', 'skype', $this->string());
        $this->addColumn('{{%tutor}}', 'phone', $this->string());
    }

    public function down()
    {
        $this->dropColumn('{{%tutor}}', 'skype');
        $this->dropColumn('{{%tutor}}', 'phone');
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
