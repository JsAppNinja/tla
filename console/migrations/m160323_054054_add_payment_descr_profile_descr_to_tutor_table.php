<?php

use yii\db\Schema;
use yii\db\Migration;

class m160323_054054_add_payment_descr_profile_descr_to_tutor_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%tutor}}', 'profile_description', $this->text());
        $this->addColumn('{{%tutor}}', 'payment_description', $this->text());
        $this->addColumn('{{%tutor}}', 'sample_video_link', $this->text());
    }

    public function down()
    {
        $this->dropColumn('{{%tutor}}', 'profile_description');
        $this->dropColumn('{{%tutor}}', 'payment_description');
        $this->dropColumn('{{%tutor}}', 'sample_video_link');
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
