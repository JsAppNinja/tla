<?php

use yii\db\Schema;
use yii\db\Migration;

class m170503_102434_add_amount_to_billing extends Migration
{
    public function up()
    {
        $this->addColumn('{{%billing}}', 'amount', $this->float());
    }

    public function down()
    {
        $this->dropColumn('{{%billing}}', 'amount');
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
