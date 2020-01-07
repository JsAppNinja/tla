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
class NgDialogAsset extends AssetBundle
{
    public $sourcePath = '@bower/ng-dialog';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $css = [
        'css/ngDialog.min.css',
        'css/ngDialog-theme-default.min.css',
        'css/ngDialog-theme-plain.min.css',
    ];
    public $js = [
        'js/ngDialog.min.js',
    ];
    public $depends = [
    ];
}