<?php

use yii\db\Schema;
use yii\db\Migration;

class m151125_085841_add_section_id_field_to_question_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%question}}', 'section_id', 'integer');
        $this->addForeignKey('fk_question_section', 'question', 'section_id', 'section', 'id', 'CASCADE', 'CASCADE');

    }

    public function down()
    {
        echo "m151125_085841_add_section_id_field_to_question_table cannot be reverted.\n";

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
