<?php

use yii\db\Schema;
use yii\db\Migration;

class m170407_042041_add_subscription_plan_to_subscriptions extends Migration
{
    public function up()
    {
        $this->addColumn('{{%subscription_plan}}', 'type', $this->boolean()->defaultValue(0));
    }

    public function down()
    {
        $this->dropColumn('{{%subscription_plan}}', 'type');
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
