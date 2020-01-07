<?php

use yii\db\Schema;
use yii\db\Migration;

class m170502_094749_create_tutor_feedback_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%tutor_feedback}}', [
            'id' => $this->primaryKey(),
            'tutor_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
            'text' => $this->string(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11)
        ], $tableOptions);

        $this->addForeignKey('fk_feedback_tutor', '{{%tutor_feedback}}', 'tutor_id', '{{%user}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_feedback_student', '{{%tutor_feedback}}', 'student_id', '{{%user}}', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%tutor_feedback}}');
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
