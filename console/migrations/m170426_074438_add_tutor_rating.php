<?php

use yii\db\Schema;
use yii\db\Migration;

class m170426_074438_add_tutor_rating extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%tutor_rating}}', [
            'id' => $this->primaryKey(),
            'tutor_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
            'type' => $this->integer(),
            'rating' => $this->float()->notNull(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11)
        ], $tableOptions);

        $this->addForeignKey('fk_rating_tutor', '{{%tutor_rating}}', 'tutor_id', '{{%user}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk_rating_student', '{{%tutor_rating}}', 'student_id', '{{%user}}', 'id', 'CASCADE', 'CASCADE');

    }

    public function down()
    {
        $this->dropTable('{{%tutor_rating}}');
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
