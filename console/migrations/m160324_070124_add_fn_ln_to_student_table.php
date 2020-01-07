<?php

use yii\db\Schema;
use yii\db\Migration;

class m160324_070124_add_fn_ln_to_student_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%student}}', 'first_name', $this->string());
        $this->addColumn('{{%student}}', 'last_name', $this->string());
    }

    public function down()
    {
        $this->dropColumn('{{%student}}', 'first_name');
        $this->dropColumn('{{%student}}', 'last_name');
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
