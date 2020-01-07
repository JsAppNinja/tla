<?php

use yii\db\Schema;
use yii\db\Migration;

class m160411_093113_add_schedule_to_examtype_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%examtype}}', 'schedule', $this->text());

    }

    public function down()
    {
        $this->dropColumn('{{%examtype}}', 'schedule');
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
