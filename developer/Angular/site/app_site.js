/**
 * Created by supostat on 16.11.15.
 */

MathJax.Hub.Config({
    showMathMenu: false,
    CommonHTML: { linebreaks: { automatic: true } },
    "HTML-CSS": { linebreaks: { automatic: true } },
    SVG: { linebreaks: { automatic: true } },
    tex2jax: {inlineMath: [['$$','$$']]},
    styles: {
        ".MathJax_Display": {
            "text-align": "left",
            margin: "1em 0em",
            width: "auto"
        }
    }
});

var app = angular.module('TLA_SITE', ['ui.bootstrap', 'timer', 'ui.bootstrap.datetimepicker', 'bootstrapLightbox', 'ngDialog', 'ui.select', 'ngSanitize'])
    .constant('ENDPOINT_URI', '/v1/').config(function (LightboxProvider) {
        LightboxProvider.getImageUrl = function (image) {
            return image.path;
        };
        LightboxProvider.getImageCaption = function (image) {
            return '';
        };
    });