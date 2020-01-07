<?php

use yii\db\Schema;
use yii\db\Migration;

class m150921_136620_Add_subjects_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%subject}}', [
            'id' => $this->primaryKey(),
            'subject_origin_id' => $this->integer(),
            'examtype_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk_subject_origin_id', 'subject', 'subject_origin_id', 'subject_origin', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_subject_type', 'subject', 'examtype_id', 'examtype', 'id', 'CASCADE', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%subject}}');
    }
}
