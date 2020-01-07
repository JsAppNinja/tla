<?php

use yii\db\Schema;
use yii\db\Migration;

class m160510_070727_add_sort_field_to_subject extends Migration
{
    public function up()
    {
        $this->addColumn('{{%subject}}', 'sort', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%subject}}', 'sort');
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
