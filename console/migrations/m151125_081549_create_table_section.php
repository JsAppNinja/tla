<?php

use yii\db\Schema;
use yii\db\Migration;

class m151125_081549_create_table_section extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%section}}', [
            'id' => $this->primaryKey(),
            'description' => $this->text(),
            'quiz_id' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk_section_quiz', 'section', 'quiz_id', 'quize', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%section}}');
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
