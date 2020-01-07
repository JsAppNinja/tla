<?php

use yii\db\Schema;
use yii\db\Migration;

class m151030_112833_add_fk_to_questions extends Migration
{
    public function up()
    {
        $this->addForeignKey('fk_question_quize', 'question', 'quize_id', 'quize', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropForeignKey('fk_question_quize', 'question');
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
