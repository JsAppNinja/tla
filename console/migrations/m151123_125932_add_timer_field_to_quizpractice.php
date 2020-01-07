<?php

use yii\db\Schema;
use yii\db\Migration;

class m151123_125932_add_timer_field_to_quizpractice extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'timer', 'boolean');
    }

    public function down()
    {
        echo "m151123_125932_add_timer_field_to_quizpractice cannot be reverted.\n";

        return false;
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
