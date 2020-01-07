<?php

use yii\db\Schema;
use yii\db\Migration;

class m160411_114343_create_tutor_announce_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%tutor_announce}}', [
            'id' => $this->primaryKey(),
            'tutor_id' => $this->integer()->notNull(),
            'status' => $this->integer(),
            'text' => $this->text(),
            'date' => $this->dateTime()
        ], $tableOptions);

        $this->addForeignKey('fk_tutor_announcement', 'tutor_announce', 'tutor_id', 'tutor', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%tutor_announce}}');
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
