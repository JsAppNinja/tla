<?php

use yii\db\Schema;
use yii\db\Migration;

class m160226_100316_add_viewed_field_to_practise_exam_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'viewed', 'boolean');
    }

    public function down()
    {
        $this->dropColumn('{{%quizpractice}}', 'viewed');

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
