/**
 * Created by supostat on 06.11.15.
 */

var elixir = require('laravel-elixir');

var baseDir = 'Angular/';

elixir.config.assetsDir = baseDir;

elixir(function(mix) {
    mix.scripts([
        './Angular/admin/libs/rangy.js',
        './Angular/admin/libs/textinputs.js',
        './Angular/admin/libs/writemath.js',
        './bower_components/angular-translate/angular-translate.js',
        './bower_components/eeh-navigation/dist/eeh-navigation.js',
        './bower_components/eeh-navigation/dist/eeh-navigation.tpl.min.js',
        './bower_components/ui-select/dist/select.min.js',
        './bower_components/angular-sanitize/angular-sanitize.min.js',
        './bower_components/angular-ui-notification/dist/angular-ui-notification.min.js',

        './bower_components/humanize/humanize.js',
        './bower_components/angularjs-humanize/src/angular-humanize.js',

        //'./Angular/admin/app_admin.js',
        './Angular/admin/**/*.js',
        './Angular/common/**/*.js',
    ], '../frontend/web/js/angular_admin.js', './');
    mix.styles([
        '../frontend/web/fonts/ubuntu.css',
        './bower_components/components-font-awesome/css/font-awesome.min.css',
        './bower_components/ui-select/dist/select.min.css',
        './bower_components/eeh-navigation/dist/eeh-navigation.css',
        './bower_components/angular-ui-notification/dist/angular-ui-notification.min.css',

        '../frontend/web/css/style.css'
    ], '../frontend/web/css/admin.css', './');
});