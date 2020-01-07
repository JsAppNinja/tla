<?php

use yii\db\Schema;
use yii\db\Migration;

class m160622_074213_add_sort_to_tutor_help_video extends Migration
{
    public function up()
    {
        $this->addColumn('{{%tutor_help_video}}', 'sort', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%tutor_help_video}}', 'sort');
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
