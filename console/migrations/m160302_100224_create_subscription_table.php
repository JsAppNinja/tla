<?php

use yii\db\Schema;
use yii\db\Migration;

class m160302_100224_create_subscription_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%subscription}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer(),
            'profile' => $this->string(),
            'start_date' => $this->date(),
            'status' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk_subscription_user', 'subscription', 'user_id', 'user', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%subscription}}');
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
