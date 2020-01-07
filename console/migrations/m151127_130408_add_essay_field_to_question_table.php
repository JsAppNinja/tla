<?php

use yii\db\Schema;
use yii\db\Migration;

class m151127_130408_add_essay_field_to_question_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%question}}', 'essay', 'boolean');
    }

    public function down()
    {
        echo "m151127_130408_add_essay_field_to_question_table cannot be reverted.\n";
        $this->dropColumn('{{%question}}', 'essay');

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
