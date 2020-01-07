<?php

use yii\db\Schema;
use yii\db\Migration;

class m160122_065332_add_datefield_to_quizpractice_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'date_of_exam', 'integer');

    }

    public function down()
    {
        $this->dropColumn('{{%quizpractice}}', 'date_of_exam');

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
