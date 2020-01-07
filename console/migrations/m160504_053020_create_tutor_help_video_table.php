<?php

use yii\db\Schema;
use yii\db\Migration;

class m160504_053020_create_tutor_help_video_table extends Migration
{
    public function up()
    {
        $tableOptions = null;

        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%tutor_help_video}}', [
            'id' => $this->primaryKey(),
            'video_id' => $this->integer()->notNull(),
            'title' => $this->string(),
            'description' => $this->text(),
            'active' => $this->boolean()->defaultValue(0),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
        ], $tableOptions);

        $this->addForeignKey('fk_tutor_help_video_video', '{{%tutor_help_video}}', 'video_id', '{{%video}}', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%tutor_help_video}}');
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
