<?php

use yii\db\Schema;
use yii\db\Migration;

class m150921_134470_Add_subject_origin_table extends Migration
{

    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%subject_origin}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),
        ], $tableOptions);

        $this->insert('{{%subject_origin}}', ['name' => 'Math']);
        $this->insert('{{%subject_origin}}', ['name' => 'English']);
        $this->insert('{{%subject_origin}}', ['name' => 'History']);
        $this->insert('{{%subject_origin}}', ['name' => 'Biology']);

    }

    public function down()
    {
        $this->dropTable('{{%subject_origin}}');
    }

}
