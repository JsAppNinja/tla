<?php

use yii\db\Schema;
use yii\db\Migration;

class m160122_082725_add_field_persent_to_practiceexam_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'percentage', 'integer');
    }

    public function down()
    {
        $this->dropColumn('{{%quizpractice}}', 'percentage');

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
