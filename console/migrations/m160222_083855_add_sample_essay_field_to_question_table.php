<?php

use yii\db\Schema;
use yii\db\Migration;

class m160222_083855_add_sample_essay_field_to_question_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%question}}', 'sample_essay', 'text');
    }

    public function down()
    {
        $this->dropColumn('{{%question}}', 'sample_essay');
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
