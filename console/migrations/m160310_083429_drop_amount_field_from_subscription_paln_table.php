<?php

use yii\db\Schema;
use yii\db\Migration;

class m160310_083429_drop_amount_field_from_subscription_paln_table extends Migration
{
    public function up()
    {
        $this->dropColumn('{{%subscription_plan}}', 'amount');
    }

    public function down()
    {
        $this->addColumn('{{%subscription_plan}}', 'amount', $this->integer());
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
