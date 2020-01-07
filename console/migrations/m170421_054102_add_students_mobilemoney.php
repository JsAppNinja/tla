<?php

use yii\db\Schema;
use yii\db\Migration;

class m170421_054102_add_students_mobilemoney extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }
        $this->createTable('{{%students_mobilemoney}}', [
            'id' => $this->primaryKey(),
            'currency_id' => $this->integer()->notNull(),
            'price' => $this->float(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
        ], $tableOptions);

        $this->addForeignKey('fk_currency_std', '{{%students_mobilemoney}}', 'currency_id', '{{%mm_country}}', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%students_mobilemoney}}');

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
