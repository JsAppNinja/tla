<?php

use yii\db\Schema;
use yii\db\Migration;

class m160310_085613_add_default_row_to_setting_table extends Migration
{
    public function up()
    {
        $this->insert('{{%system_setting}}', ['amount_per_student' => null, 'student_monthly_amount' => null, 'recurring_period' => null]);
    }

    public function down()
    {

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
