<?php

use yii\db\Schema;
use yii\db\Migration;

class m160321_091209_add_payment_enabled_field_to_settings_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%system_setting}}', 'payment_enabled', $this->boolean());
    }

    public function down()
    {
        $this->dropColumn('{{%system_setting}}', 'payment_enabled');
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
