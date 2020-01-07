<?php

use yii\db\Schema;
use yii\db\Migration;

class m160509_073604_add_sort_to_examtype_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%examtype}}', 'sort', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%examtype}}', 'sort');
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
