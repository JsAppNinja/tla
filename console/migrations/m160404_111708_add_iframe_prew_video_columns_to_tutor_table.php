<?php

use yii\db\Schema;
use yii\db\Migration;

class m160404_111708_add_iframe_prew_video_columns_to_tutor_table extends Migration
{
    public function up()
    {
        $this->addColumn('{{%tutor}}', 'iframe', $this->text());
        $this->addColumn('{{%tutor}}', 'preview_video_img', $this->string());
    }

    public function down()
    {
        $this->dropColumn('{{%tutor}}', 'iframe');
        $this->dropColumn('{{%tutor}}', 'preview_video_img');
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
