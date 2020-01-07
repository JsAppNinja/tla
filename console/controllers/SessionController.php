<?php
namespace console\controllers;

use Yii;
use yii\console\Controller;

class SessionController extends Controller
{
    public function actionInit()
    {
        $tableOptions = null;
        if (Yii::$app->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        Yii::$app->db->createCommand()->createTable('session', [
            'id' => 'CHAR(40) NOT NULL PRIMARY KEY',
            'expire' => 'INTEGER',
            'data'  => 'BLOB',
            'uid' => 'INTEGER',
        ], $tableOptions)->execute();
    }
}
