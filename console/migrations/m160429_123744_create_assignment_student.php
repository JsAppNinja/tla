<?php

use yii\db\Schema;
use yii\db\Migration;

class m160429_123744_create_assignment_student extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%assignment_student}}', [
            'id' => $this->primaryKey(),
            'student_id' => $this->integer()->notNull(),
            'assignment_id' => $this->integer()->notNull(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11)
        ], $tableOptions);

        $this->addForeignKey('fk_assignment_student_assignment', '{{%assignment_student}}', 'assignment_id', '{{%assignment}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_assignment_student_student', '{{%assignment_student}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%assignment_student}}');
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
