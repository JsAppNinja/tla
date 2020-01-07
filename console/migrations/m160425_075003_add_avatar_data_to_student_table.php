<?php

use yii\db\Schema;
use yii\db\Migration;

class m160425_075003_add_avatar_data_to_student_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%student}}', 'avatar', $this->string());
        $this->addColumn('{{%student}}', 'avatar_original', $this->string());
    }

    public function down()
    {
        $this->dropColumn('{{%student}}', 'avatar');
        $this->dropColumn('{{%student}}', 'avatar_original');
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
