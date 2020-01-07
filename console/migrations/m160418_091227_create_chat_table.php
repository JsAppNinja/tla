<?php

use yii\db\Schema;
use yii\db\Migration;

class m160418_091227_create_chat_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%chat}}', [
            'id' => $this->primaryKey(),
            'tutor_id' => $this->integer(),
            'student_id' => $this->integer(),
            'message' => $this->text(),
            'readed' => $this->boolean(),
            'owner' => $this->integer(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11)
        ], $tableOptions);

        $this->addForeignKey('fk_chat_tutor', '{{%chat}}', 'tutor_id', '{{%tutor}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_chat_student', '{{%chat}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'CASCADE');

    }

    public function down()
    {
        $this->dropTable('{{%chat}}');
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
