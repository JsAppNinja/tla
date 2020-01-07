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
class AngularBusyAsset extends AssetBundle
{
    public $sourcePath = '@bower/angular-busy/dist';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $css = [
        'angular-busy.min.css',
    ];
    public $js = [
        'angular-busy.min.js',
    ];
    public $depends = [
    ];
}