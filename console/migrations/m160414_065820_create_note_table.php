<?php

use yii\db\Schema;
use yii\db\Migration;

class m160414_065820_create_note_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%note}}', [
            'id' => $this->primaryKey(),
            'lesson_id' => $this->integer()->notNull(),
            'status' => $this->integer(),
            'title' => $this->string(),
            'description' => $this->text(),
            'file_name' => $this->string(),
            'file_type' => $this->string(),
            'origin_file_name' => $this->string(),
            'file_path' => $this->string()

        ], $tableOptions);

        $this->addForeignKey('fk_note_lesson', 'note', 'lesson_id', 'lesson', 'id', 'CASCADE', 'CASCADE');

    }

    public function down()
    {
        $this->dropTable('{{%note}}');
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
