<?php

use yii\db\Schema;
use yii\db\Migration;

class m160125_115359_add_soft_delete_for_quiz_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quize}}', 'delete_time', 'integer');
    }

    public function down()
    {
        $this->dropColumn('{{%quize}}', 'delete_time');

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
