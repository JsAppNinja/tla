<?php

use yii\db\Schema;
use yii\db\Migration;

class m160401_112433_add_active_field_to_quize_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quize}}', 'active', $this->boolean()->defaultValue(1));
    }

    public function down()
    {
        $this->dropColumn('{{%quize}}', 'active');
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
