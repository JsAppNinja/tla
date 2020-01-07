/**
 * Created by supostat on 06.11.15.
 */

var elixir = require('laravel-elixir');

var baseDir = 'Angular/';

elixir.config.assetsDir = baseDir;

elixir(function(mix) {
    mix.scripts([
        './bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
        './Angular/admin/libs/rangy.js',
        './Angular/admin/libs/textinputs.js',
        './Angular/admin/libs/writemath.js',
        './bower_components/angular-translate/angular-translate.js',
        './bower_components/eeh-navigation/dist/eeh-navigation.js',
        './bower_components/ng-img-crop/compile/minified/ng-img-crop.js',
        './bower_components/angular-sanitize/angular-sanitize.min.js',
        './bower_components/eeh-navigation/dist/eeh-navigation.tpl.min.js',
        './bower_components/humanize/humanize.js',
        './bower_components/angularjs-humanize/src/angular-humanize.js',
        './bower_components/angular-ui-notification/dist/angular-ui-notification.min.js',
        './bower_components/checklist-model/checklist-model.js',
        './bower_components/angular-base64/angular-base64.min.js',
        './bower_components/ng-scrollbars/src/scrollbars.js',
        './bower_components/ui-select/dist/select.min.js',
        './Angular/tutor/**/*.js',
        './Angular/common/**/*.js',
    ], '../frontend/web/js/angular_tutor.js', './');
    mix.styles([
        '../frontend/web/fonts/ubuntu.css',
        './bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css',
        './bower_components/components-font-awesome/css/font-awesome.min.css',
        './bower_components/eeh-navigation/dist/eeh-navigation.css',
        './bower_components/ui-select/dist/select.min.css',
        './bower_components/angular-ui-notification/dist/angular-ui-notification.min.css',
        './bower_components/ng-img-crop/compile/minified/ng-img-crop.css',
        '../frontend/web/css/style.css',
    ], '../frontend/web/css/tutor.css', './');
});