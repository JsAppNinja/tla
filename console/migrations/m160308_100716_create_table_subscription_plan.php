<?php

use yii\db\Schema;
use yii\db\Migration;

class m160308_100716_create_table_subscription_plan extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%subscription_plan}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),
            'amount' => $this->integer(),
            'students_count' => $this->integer(),
        ], $tableOptions);

//        $this->addForeignKey('fk_subscription_user', 'subscription', 'user_id', 'user', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%subscription_plan}}');
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
