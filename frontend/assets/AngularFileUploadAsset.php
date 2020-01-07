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
class AngularFileUploadAsset extends AssetBundle
{
    public $sourcePath = '@bower/ng-file-upload';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $js = [
        'ng-file-upload-all.min.js',
    ];
    public $depends = [
    ];
}