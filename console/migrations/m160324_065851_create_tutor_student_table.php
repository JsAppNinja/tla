<?php

use yii\db\Schema;
use yii\db\Migration;

class m160324_065851_create_tutor_student_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%tutor_student}}', [
            'tutor_id' => $this->integer(),
            'student_id' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk_tutorstudent_tutor', 'tutor_student', 'tutor_id', 'tutor', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_tutorstudent_student', 'tutor_student', 'student_id', 'student', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%tutor_student}}');
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
