<?php

use yii\db\Schema;
use yii\db\Migration;

class m150921_134449_Add_exam_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%exam}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),
            'examtype_id' => $this->integer(),
            'subject_id' => $this->integer(),
            'date' => $this->date(),
            'hours' => $this->string(10),

            'user_id' => $this->integer()->notNull(),
        ], $tableOptions);
    }

    public function down()
    {
        $this->dropTable('{{%exam}}');
    }

}
