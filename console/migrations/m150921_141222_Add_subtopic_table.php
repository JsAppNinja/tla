<?php

use yii\db\Schema;
use yii\db\Migration;

class m150921_141222_Add_subtopic_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%subtopic}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),

            'topic_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_subtopic_topic', 'subtopic', 'topic_id', 'topic', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%subtopic}}');
    }
}
