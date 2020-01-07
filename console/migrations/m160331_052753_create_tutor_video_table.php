<?php

use yii\db\Schema;
use yii\db\Migration;

class m160331_052753_create_tutor_video_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%tutor_video}}', [
            'id' => $this->primaryKey(),
            'tutor_id' => $this->integer(),
            'lesson_id' => $this->integer(),
            'video_url' => $this->string(),
            'title' => $this->string(),
            'description' => $this->text(),
            'preview_img' => $this->string(),
            'iframe' => $this->string(),
            'status' => $this->integer()
        ], $tableOptions);

        $this->addForeignKey('fk_tutor_video_tutor', 'tutor_video', 'tutor_id', 'tutor', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_tutor_video_lesson', 'tutor_video', 'lesson_id', 'lesson', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%tutor_video}}');
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
