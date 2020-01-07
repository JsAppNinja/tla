<?php

use yii\db\Schema;
use yii\db\Migration;

class m151123_140305_add_topicand_subtopic_fields_to_quizpractice extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'topic_id', 'integer');
        $this->addColumn('{{%quizpractice}}', 'subtopic_id', 'integer');
    }

    public function down()
    {
        echo "m151123_140305_add_topicand_subtopic_fields_to_quizpractice cannot be reverted.\n";

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
