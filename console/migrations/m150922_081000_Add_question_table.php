<?php

use yii\db\Schema;
use yii\db\Migration;

class m150922_081000_Add_question_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%question}}', [
            'id' => $this->primaryKey(),
            'content' => $this->text(),
            'topic_id' => $this->integer(),
            'subtopic_id' => $this->integer(),

            'quize_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_question_topic', 'question', 'topic_id', 'topic', 'id', 'SET NULL', 'CASCADE');
        $this->addForeignKey('fk_question_subtopic', 'question', 'subtopic_id', 'subtopic', 'id', 'SET NULL', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%question}}');
    }

}
