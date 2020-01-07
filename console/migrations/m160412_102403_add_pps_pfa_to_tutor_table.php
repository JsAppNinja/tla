<?php

use yii\db\Schema;
use yii\db\Migration;

class m160412_102403_add_pps_pfa_to_tutor_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%tutor}}', 'price_per_subject', $this->integer());
        $this->addColumn('{{%tutor}}', 'price_for_all_subjects', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%tutor}}', 'price_per_subject');
        $this->dropColumn('{{%tutor}}', 'price_for_all_subjects');
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
