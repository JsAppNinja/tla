<?php

use yii\db\Schema;
use yii\db\Migration;

class m160405_042038_add_active_field_to_examtype_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%examtype}}', 'active', $this->boolean()->defaultValue(true));
    }

    public function down()
    {
        $this->dropColumn('{{%examtype}}', 'active');
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
