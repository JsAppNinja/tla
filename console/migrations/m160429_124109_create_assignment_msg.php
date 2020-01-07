<?php

use yii\db\Schema;
use yii\db\Migration;

class m160429_124109_create_assignment_msg extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%assignment_msg}}', [
            'id' => $this->primaryKey(),
            'body' => $this->text(),
            'assignment_student_id' => $this->integer()->notNull(),
            'created_at' => $this->integer(11),
            'owner_id' => $this->integer(),
            'owner_type' => $this->integer(),
            'updated_at' => $this->integer(11),
        ], $tableOptions);

        $this->addForeignKey('fk_assignment_msg_assignment_std', '{{%assignment_msg}}', 'assignment_student_id', '{{%assignment_student}}', 'id', 'CASCADE', 'CASCADE');

    }

    public function down()
    {
        $this->dropTable('{{%assignment_msg}}');
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
