<?php

use yii\db\Schema;
use yii\db\Migration;

class m140924_110226_Add_examtype_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%examtype}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),
            'type' => $this->smallInteger()->notNull()->defaultValue(1), //1 - grade level, 2 - exam type

            'user_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_examtype_user', 'examtype', 'user_id', 'user', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%examtype}}');
    }
}
