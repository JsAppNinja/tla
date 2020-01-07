<?php

use yii\db\Schema;
use yii\db\Migration;

class m151104_112941_delete_fk_user_from_topic extends Migration
{
    public function up()
    {
        $this->dropForeignKey('fk_topic_user', 'topic');
    }

    public function down()
    {
        echo "m151104_112941_delete_fk_user_from_topic cannot be reverted.\n";

        return false;
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
