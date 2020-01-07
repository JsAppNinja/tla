/**
 * Created by supostat on 06.11.15.
 */

var elixir = require('laravel-elixir');
require('laravel-elixir-stylus');
require('laravel-elixir-spritesmith');

elixir.config.assetsPath = "./";

elixir(function (mix) {
    mix.scripts([
        './bower_components/ui-select/dist/select.min.js',
        './bower_components/angular-sanitize/angular-sanitize.min.js',
        'site/**/*.js',
        'common/**/*.js'], '../frontend/web/js/angular_site.js', 'Angular/');
    mix.stylus('site/main.styl', '../frontend/web/css/landing.css', 'stylus/');
    mix.styles(
        [
            './bower_components/components-font-awesome/css/font-awesome.min.css',
            './bower_components/ui-select/dist/select.min.css',
            '../frontend/web/css/style.css',
        ], '../frontend/web/css/site.css', './'
    )
    ;
    mix.spritesmith('sprites/', {
        imgOutput: '../frontend/web/images',
        cssOutput: 'stylus/site/',
        cssName: 'sprites.styl',
        imgPath: '../images/sprite.png'
    });
});