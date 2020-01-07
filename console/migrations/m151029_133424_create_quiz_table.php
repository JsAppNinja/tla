<?php

use yii\db\Schema;
use yii\db\Migration;

class m151029_133424_create_quiz_table extends Migration
{


    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%quize}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),
            'description' => $this->string(),
            'subject_id' => $this->integer(),
            'date' => $this->date(),
            'hours' => $this->float(),
        ], $tableOptions);

        $this->addForeignKey('fk_exam_subject', 'quize', 'subject_id', 'subject', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%quize}}');
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
