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
class AngularBootstrapAsset extends AssetBundle
{
    public $sourcePath = '@bower/angular-bootstrap';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $css = [
//        'css/xeditable.css',
    ];
    public $js = [
        'ui-bootstrap.min.js',
        'ui-bootstrap-tpls.min.js',
    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}