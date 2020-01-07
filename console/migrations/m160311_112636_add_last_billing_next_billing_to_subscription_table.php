<?php

use yii\db\Schema;
use yii\db\Migration;

class m160311_112636_add_last_billing_next_billing_to_subscription_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%subscription}}', 'last_billing_date', $this->dateTime());
        $this->addColumn('{{%subscription}}', 'next_billing_date', $this->dateTime());
    }

    public function down()
    {
        $this->dropColumn('{{%subscription}}', 'last_billing_date');
        $this->dropColumn('{{%subscription}}', 'next_billing_date');
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
