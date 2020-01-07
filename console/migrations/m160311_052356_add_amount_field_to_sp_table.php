<?php

use yii\db\Schema;
use yii\db\Migration;

class m160311_052356_add_amount_field_to_sp_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%subscription_plan}}', 'amount', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%subscription_plan}}', 'amount');
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
