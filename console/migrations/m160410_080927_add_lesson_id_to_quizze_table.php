<?php

use yii\db\Schema;
use yii\db\Migration;

class m160410_080927_add_lesson_id_to_quizze_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quize}}', 'lesson_id', $this->integer());
        $this->addForeignKey('fk_quize_lesson', '{{%quize}}', 'lesson_id', 'lesson', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropColumn('{{%quize}}', 'lesson_id');
        $this->dropForeignKey('fk_quize_lesson', '{{%quize}}');
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
