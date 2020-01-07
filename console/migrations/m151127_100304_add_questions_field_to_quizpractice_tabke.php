<?php

use yii\db\Schema;
use yii\db\Migration;

class m151127_100304_add_questions_field_to_quizpractice_tabke extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'qn', 'integer');
    }

    public function down()
    {
        echo "m151127_100304_add_questions_field_to_quizpractice_tabke cannot be reverted.\n";
        $this->dropColumn('{{%quizpractice}}', 'qn');
        return true;
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
