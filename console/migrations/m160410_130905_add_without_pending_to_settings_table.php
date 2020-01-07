<?php

use yii\db\Schema;
use yii\db\Migration;

class m160410_130905_add_without_pending_to_settings_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%system_setting}}', 'without_pending', $this->boolean());
    }

    public function down()
    {
        $this->dropColumn('{{%system_setting}}', 'without_pending');
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
