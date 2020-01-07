/**
 * Created by supostat on 01.11.15.
 */
function ucfirst(str) {
    var first = str.charAt(0).toUpperCase();
    return first + str.substr(1);
}

MathJax.Hub.Config({
    tex2jax: {inlineMath: [["$!", "$!"]]},
    displayAlign: "center",
    displayIndent: "0.5em",
});

MathJax.Hub.Configured();

var app = angular.module('TLA_ADMIN', ['xeditable', 'ui.router', 'ngDialog',
    'ncy-angular-breadcrumb', 'cgBusy', 'ui.bootstrap', 'ui.router.tabs', 'ngFileUpload', 'cgNotify', 'ngMessages', 'ui.tinymce', 'bootstrapLightbox'])
    .constant('ENDPOINT_URI', '/v1/').run(function (editableOptions) {
        editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    }).config(function (LightboxProvider) {
        LightboxProvider.getImageUrl = function (image) {
            return image.path;
        };
        LightboxProvider.getImageCaption = function (image) {
            return image.label;
        };
    }).filter('htmlToPlaintext', function () {
        return function (text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };
    });

