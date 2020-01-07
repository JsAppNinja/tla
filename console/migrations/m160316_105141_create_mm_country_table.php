<?php

use yii\db\Schema;
use yii\db\Migration;

class m160316_105141_create_mm_country_table extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%mm_country}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),
            'currency' => $this->string(),
            'phones' => $this->string(),
        ], $tableOptions);
    }

    public function down()
    {
        $this->dropTable('{{mm_country}}');
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
