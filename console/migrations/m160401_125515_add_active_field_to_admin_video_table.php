<?php

use yii\db\Schema;
use yii\db\Migration;

class m160401_125515_add_active_field_to_admin_video_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%admin_video}}', 'active', $this->boolean()->defaultValue(1));
        $this->addColumn('{{%tutor_video}}', 'active', $this->boolean()->defaultValue(1));
    }

    public function down()
    {
        $this->dropColumn('{{%admin_video}}', 'active');
        $this->dropColumn('{{%tutor_video}}', 'active');
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
