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
class JQueryUIAsset extends AssetBundle
{
    public $sourcePath = '@bower/jquery-ui';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $js = [
        'jquery-ui.min.js',
    ];
    public $depends = [
    ];
}