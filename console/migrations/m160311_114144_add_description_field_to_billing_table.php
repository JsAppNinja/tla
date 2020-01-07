<?php

use yii\db\Schema;
use yii\db\Migration;

class m160311_114144_add_description_field_to_billing_table extends Migration
{
    public function up()
    {
        $this->dropColumn('{{%billing}}', 'last_billing_date');
        $this->dropColumn('{{%billing}}', 'next_billing_date');
        $this->addColumn('{{%billing}}', 'date', $this->dateTime());
        $this->addColumn('{{%billing}}', 'description', $this->string());
    }

    public function down()
    {
        $this->addColumn('{{%billing}}', 'last_billing_date', $this->date());
        $this->addColumn('{{%billing}}', 'next_billing_date', $this->date());
        $this->dropColumn('{{%billing}}', 'date');
        $this->dropColumn('{{%billing}}', 'description');
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
