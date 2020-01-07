<?php

use yii\db\Schema;
use yii\db\Migration;

class m160428_104903_create_assignment_file_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%assignment_file}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),
            'origin_name' => $this->string(),
            'file_type' => $this->string(),
            'type' => $this->integer(),
            'student_id' => $this->integer(),
            'assignment_id' => $this->integer(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
        ], $tableOptions);

        $this->addForeignKey('fk_assignment_file_assignment', '{{%assignment_file}}', 'assignment_id', '{{%assignment}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_assignment_file_student', '{{%assignment_file}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'CASCADE');

    }

    public function down()
    {
        $this->dropTable('{{%assignment_file}}');

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
