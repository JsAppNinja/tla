<?php

use yii\db\Schema;
use yii\db\Migration;

class m151118_095226_add_status_column_in_quizpractice_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quizpractice}}', 'status', 'integer');
    }

    public function down()
    {
        echo "m151118_095226_add_status_column_in_quizpractice_table cannot be reverted.\n";

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
