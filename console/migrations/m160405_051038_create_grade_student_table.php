<?php

use yii\db\Schema;
use yii\db\Migration;

class m160405_051038_create_grade_student_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%subject_student}}', [
            'subject_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_grade_student_subject', 'subject_student', 'subject_id', 'subject', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_grade_student_student', 'subject_student', 'student_id', 'student', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%subject_student}}');
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
