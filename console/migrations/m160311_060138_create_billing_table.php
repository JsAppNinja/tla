<?php

use yii\db\Schema;
use yii\db\Migration;

class m160311_060138_create_billing_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%billing}}', [
            'id' => $this->primaryKey(),
            'subscription_id' => $this->integer()->notNull(),
            'last_billing_date' => $this->date(),
            'next_billing_date' => $this->date(),
            'status' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk_billing_subscription', 'billing', 'subscription_id', 'subscription', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%billing}}');
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
