<?php

use yii\db\Schema;
use yii\db\Migration;

class m150922_082748_Add_answer_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%answer}}', [
            'id' => $this->primaryKey(),
            'content' => $this->text(),
            'correct' => $this->boolean(),

            'question_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_answer_question', 'answer', 'question_id', 'question', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%answer}}');
    }
}
