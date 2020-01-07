<?php

use yii\db\Schema;
use yii\db\Migration;

class m160308_113152_add_description_field_to_subscription_plan_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%subscription_plan}}', 'description', 'text');
    }

    public function down()
    {
        $this->dropColumn('{{%subscription_plan}}', 'description');
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
