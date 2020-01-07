<?php

use yii\db\Schema;
use yii\db\Migration;

class m160323_050245_create_tutor_subject_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%tutor_subject}}', [
            'subject_id' => $this->integer()->notNull(),
            'tutor_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_tutorsubject_tutor', 'tutor_subject', 'tutor_id', 'tutor', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_tutorsubject_subject', 'tutor_subject', 'subject_id', 'subject_origin', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%tutor_subject}}');
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
