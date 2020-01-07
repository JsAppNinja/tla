<?php

use yii\db\Schema;
use yii\db\Migration;

class m160621_175754_change_user_fields extends Migration
{
    public function up()
    {
        $this->alterColumn('{{%examtype}}', 'user_id', $this->integer());
        $this->dropForeignKey('fk_examtype_user', '{{%examtype}}');
        $this->addForeignKey('fk_examtype_user', 'examtype', 'user_id', 'user', 'id', 'SET NULL', 'CASCADE');
    }

    public function down()
    {
        echo "m160621_175754_change_user_fields cannot be reverted.\n";

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
