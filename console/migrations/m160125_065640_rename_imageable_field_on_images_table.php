<?php

use yii\db\Schema;
use yii\db\Migration;

class m160125_065640_rename_imageable_field_on_images_table extends Migration
{
    public function up()
    {
        $this->alterColumn('{{%images}}', 'imageable_type', $this->integer());
    }

    public function down()
    {
        return true;
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
