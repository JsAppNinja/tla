<?php

use yii\db\Schema;
use yii\db\Migration;

class m170124_112800_change_system_settings_column_type extends Migration
{
    public function up()
    {
        $this->alterColumn('{{%system_setting}}', 'student_monthly_amount', $this->float());
    }

    public function down()
    {
        $this->alterColumn('{{%system_setting}}', 'student_monthly_amount', $this->integer());
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
