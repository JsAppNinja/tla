/**
 * Created by supostat on 06.11.15.
 */

var elixir = require('laravel-elixir');

var baseDir = 'Angular/';
elixir.config.assetsDir = baseDir;

elixir(function(mix) {
    mix.styles(['css/non-responsive.css', 'css/site.css'], '../frontend/web/css/main.css', '../frontend/web/');
});