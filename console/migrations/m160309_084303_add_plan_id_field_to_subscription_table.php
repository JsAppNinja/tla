<?php

use yii\db\Schema;
use yii\db\Migration;

class m160309_084303_add_plan_id_field_to_subscription_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%subscription}}', 'plan_id', 'integer DEFAULT NULL');

        $this->addForeignKey('fk_subscription_plan', 'subscription', 'plan_id', 'subscription_plan', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropColumn('{{%subscription}}', 'plan_id');
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
