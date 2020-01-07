<?php

use yii\db\Schema;
use yii\db\Migration;

class m160124_111229_add_sort_field_to_quiz_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%quize}}', 'sort', 'integer');
    }

    public function down()
    {
        $this->dropColumn('{{%quize}}', 'sort');
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
