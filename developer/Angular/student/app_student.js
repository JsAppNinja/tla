/**
 * Created by supostat on 16.11.15.
 */

MathJax.Hub.Config({
    CommonHTML: {linebreaks: {automatic: true}},
    "HTML-CSS": {linebreaks: {automatic: true}},
    SVG: {linebreaks: {automatic: true}},
    showMathMenu: false,
    tex2jax: {inlineMath: [['$$', '$$']]},
    styles: {
        ".MathJax_Display": {
            "text-align": "left",
            margin: "1em 0em",
            width: "auto"
        }
    }
});


var app = angular.module('TLA_STUDENT', ['ui.bootstrap', 'timer', 'ngDialog', 'ui.select', 'ngSanitize', 'ui-notification', 'rzModule', 'ngScrollbars', 'ngImgCrop', 'ngFileUpload'])
    .constant('ENDPOINT_URI', '/v1/')
    .config(function (NotificationProvider) {
        NotificationProvider.setOptions({
            delay: 10000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'top'
        });
    })
    .filter('rangeFilter', function () {
        return function (items, rangeInfo) {
            var filtered = [];
            var min = parseInt(rangeInfo.priceMin);
            var max = parseInt(rangeInfo.priceMax);
            // If time is with the range
            angular.forEach(items, function (item) {
                if (item[rangeInfo.property] >= min && item[rangeInfo.property] <= max) {
                    filtered.push(item);
                }
            });
            return filtered;
        };
    })
    .directive('customOnChange', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    })
    .directive(
        "bnCmdEnter",
        function cmdEnterDirective() {
            return ({
                link: link,
                require: "^?form",
                restrict: "A"
            });
            function link(scope, element, attributes, formController) {
                if (!attributes.bnCmdEnter && !formController) {
                    return;
                }

                element.on("keydown", handleKeyEvent);

                function closestForm() {
                    var parent = element.parent();
                    while (parent.length && ( parent[0].tagName !== "FORM" )) {
                        parent = parent.parent();
                    }
                    return ( parent );
                }

                // I listen for key events, looking for the CMD+Enter combination.
                function handleKeyEvent(event) {
                    // Is CMD+Enter event.
                    if (( event.which === 13 ) && event.metaKey) {
                        event.preventDefault();
                        attributes.bnCmdEnter
                            ? triggerExpression(event)
                            : triggerFormEvent()
                        ;
                    }
                }

                function triggerExpression(keyEvent) {
                    scope.$apply(
                        function changeViewModel() {
                            scope.$eval(
                                attributes.bnCmdEnter,
                                {
                                    $event: keyEvent
                                }
                            );
                        }
                    );
                }

                // I find the closest form element and trigger the "submit" event.
                function triggerFormEvent() {
                    closestForm().triggerHandler("submit");
                }
            }
        }
    )
    .filter('truncate', function () {
        return function (text, length) {
            if (text) {
                var words = text.split(' ');
                if (words.length < length) {
                    return text;
                }
                return words.slice(0, length).join(' ') + ' …';
            }
        };
    });