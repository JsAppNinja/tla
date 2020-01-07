<?php

use yii\db\Schema;
use yii\db\Migration;

class m160426_065508_add_quize_type_to_quiz_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quize}}', 'type', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%quize}}', 'type');
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
