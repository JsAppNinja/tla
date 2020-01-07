<?php

use yii\db\Schema;
use yii\db\Migration;

class m160401_070242_create_admin_video_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%admin_video}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer(),
            'subject_id' => $this->integer(),
            'video_url' => $this->string(),
            'title' => $this->string(),
            'description' => $this->text(),
            'preview_img' => $this->string(),
            'iframe' => $this->string(),
            'status' => $this->integer(),
            'free' => $this->integer()
        ], $tableOptions);

        $this->addForeignKey('fk_admin_video_user', 'admin_video', 'user_id', 'user', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_admin_video_subject', 'admin_video', 'subject_id', 'subject_origin', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%admin_video}}');
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
