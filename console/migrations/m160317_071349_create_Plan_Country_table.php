<?php

use yii\db\Schema;
use yii\db\Migration;

class m160317_071349_create_Plan_Country_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%plan_country}}', [
            'plan_id' => $this->integer()->notNull(),
            'country_id' => $this->integer()->notNull(),
            'price' => $this->string(),
        ], $tableOptions);

        $this->addForeignKey('FK_Plans_plan', 'plan_country', 'plan_id', 'subscription_plan', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('FK_Countries_country', 'plan_country', 'country_id', 'mm_country', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%plan_country}}');
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
