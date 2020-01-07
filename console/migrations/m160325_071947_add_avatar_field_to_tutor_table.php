<?php

use yii\db\Schema;
use yii\db\Migration;

class m160325_071947_add_avatar_field_to_tutor_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%tutor}}', 'avatar', $this->string());
        $this->addColumn('{{%tutor}}', 'avatar_original', $this->string());
    }

    public function down()
    {
        $this->dropColumn('{{%tutor}}', 'avatar');
        $this->dropColumn('{{%tutor}}', 'avatar_original');
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
