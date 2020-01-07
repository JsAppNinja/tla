<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace frontend\assets;

use yii\web\AssetBundle;

/**
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class AngularMessages extends AssetBundle
{
    public $sourcePath = '@bower/angular-messages';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $js = [
        'angular-messages.min.js',
    ];
    public $depends = [
    ];
}