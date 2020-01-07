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
class UIRouterAsset extends AssetBundle
{
    public $sourcePath = '@bower/angular-ui-router/release';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $js = [
        'angular-ui-router.min.js',
    ];
    public $depends = [
    ];
}