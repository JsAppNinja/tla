<?php

use yii\db\Schema;
use yii\db\Migration;

class m151201_100712_add_free_field_to_examtypes_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%examtype}}', 'free', 'boolean');
    }

    public function down()
    {
        $this->dropColumn('{{%examtype}}', 'free');

        return true;
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
