<?php

use yii\db\Schema;
use yii\db\Migration;

class m160427_112203_add_comment_field_to_quizpractice extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'comment', $this->text());
    }

    public function down()
    {
        $this->dropColumn('{{%quizpractice}}', 'comment');
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
