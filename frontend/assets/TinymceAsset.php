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
class TinymceAsset extends AssetBundle
{
    public $sourcePath = '@bower/tinymce-dist';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $js = [
        'tinymce.min.js',
        'themes/modern/theme.min.js',
        'plugins/code/plugin.min.js',
    ];
    public $depends = [
    ];
}