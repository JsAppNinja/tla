<?php

use yii\db\Schema;
use yii\db\Migration;

class m170124_113254_change_subscription_plan_column_type extends Migration
{
    public function up()
    {
        $this->alterColumn('{{%subscription_plan}}', 'amount', $this->float());
    }

    public function down()
    {
        $this->alterColumn('{{%subscription_plan}}', 'amount', $this->integer());
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
