<?php

use yii\db\Schema;
use yii\db\Migration;

class m151109_141134_edit_essay_table extends Migration
{
    public function up()
    {
        $this->dropForeignKey('fk_essay_exam', '{{%essay}}');
        $this->dropColumn('{{%essay}}', 'exam_id');
        $this->addColumn('{{%essay}}', 'quize_id', 'integer');
        $this->addForeignKey('fk_essay_quize', '{{%essay}}', 'quize_id', 'quize', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        echo "m151109_141134_edit_essay_table cannot be reverted.\n";

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
