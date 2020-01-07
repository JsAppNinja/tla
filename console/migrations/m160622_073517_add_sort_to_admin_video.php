<?php

use yii\db\Schema;
use yii\db\Migration;

class m160622_073517_add_sort_to_admin_video extends Migration
{
    public function up()
    {
        $this->addColumn('{{%admin_video}}', 'sort', $this->integer());
    }

    public function down()
    {
        $this->dropColumn('{{%admin_video}}', 'sort');
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
