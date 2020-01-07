<?php

use yii\db\Schema;
use yii\db\Migration;

class m151116_141512_create_quizpractice_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%quizpractice}}', [
            'id' => $this->primaryKey(),
            'quiz_id' => $this->integer(),
            'student_id' => $this->integer(),
            'start_practice' => $this->integer(),
        ], $tableOptions);
    }

    public function down()
    {
        echo "m151116_141512_create_quizpractice_table cannot be reverted.\n";

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
