<?php

use yii\db\Schema;
use yii\db\Migration;

class m160323_051231_create_student_request_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%student_request}}', [
            'tutor_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_request_tutor', 'student_request', 'tutor_id', 'tutor', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_request_student', 'student_request', 'student_id', 'student', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%student_request}}');
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
