<?php

use yii\db\Schema;
use yii\db\Migration;

class m151117_071713_appent_fields_in_quizpractice extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'answers', 'text');
    }

    public function down()
    {
        echo "m151117_071713_appent_fields_in_quizpractice cannot be reverted.\n";

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
