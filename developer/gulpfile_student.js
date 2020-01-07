/**
 * Created by supostat on 06.11.15.
 */

var elixir = require('laravel-elixir');

var baseDir = 'Angular/';

elixir.config.assetsDir = baseDir;

elixir(function(mix) {
    mix.scripts([
        './bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
        './bower_components/ui-select/dist/select.min.js',
        './bower_components/angular-sanitize/angular-sanitize.min.js',
        './bower_components/angularjs-slider/dist/rzslider.min.js',
        './bower_components/angular-ui-notification/dist/angular-ui-notification.min.js',
        './bower_components/ng-scrollbars/src/scrollbars.js',
        './bower_components/ng-img-crop/compile/minified/ng-img-crop.js',
        'student/**/*.js', 'common/**/*.js'
    ], '../frontend/web/js/angular_student.js', baseDir);
    mix.styles([
        './bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css',
        '../frontend/web/fonts/ubuntu.css',
        './bower_components/angularjs-slider/dist/rzslider.min.css',
        './bower_components/components-font-awesome/css/font-awesome.min.css',
        './bower_components/ui-select/dist/select.min.css',
        './bower_components/ng-img-crop/compile/minified/ng-img-crop.css',
        './bower_components/angular-ui-notification/dist/angular-ui-notification.min.css',
        '../frontend/web/css/style.css',
    ], '../frontend/web/css/student.css', './')
});