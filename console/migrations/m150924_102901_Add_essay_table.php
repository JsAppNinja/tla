<?php

use yii\db\Schema;
use yii\db\Migration;

class m150924_102901_Add_essay_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%essay}}', [
            'id' => $this->primaryKey(),
            'content' => $this->text(),
            'correct_answer' => $this->text(),

            'exam_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_essay_exam', 'essay', 'exam_id', 'exam', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%essay}}');
    }
}
