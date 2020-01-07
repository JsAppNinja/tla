/**
 * Created by supostat on 01.11.15.
 */
function ucfirst(str) {
    var first = str.charAt(0).toUpperCase();
    return first + str.substr(1);
}

var isAdmin = false;

function init(admin) {
    if (admin == 1) {
        isAdmin = true;
    }
}

MathJax.Hub.Config({
    showMathMenu: false,
    displayAlign: "center",
    displayIndent: "0.5em",
});

(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['angular', './Sortable'], factory);
    }
    else if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        require('angular');
        factory(angular, require('./Sortable'));
        module.exports = 'ng-sortable';
    }
    else if (window.angular && window.Sortable) {
        factory(angular, Sortable);
    }
})(function (angular, Sortable) {
    'use strict';


    /**
     * @typedef   {Object}        ngSortEvent
     * @property  {*}             model      List item
     * @property  {Object|Array}  models     List of items
     * @property  {number}        oldIndex   before sort
     * @property  {number}        newIndex   after sort
     */

    var expando = 'Sortable:ng-sortable';

    angular.module('ng-sortable', [])
        .constant('ngSortableVersion', '0.4.0')
        .constant('ngSortableConfig', {})
        .directive('ngSortable', ['$parse', 'ngSortableConfig', function ($parse, ngSortableConfig) {
            var removed,
                nextSibling,
                getSourceFactory = function getSourceFactory(el, scope) {
                    var ngRepeat = [].filter.call(el.childNodes, function (node) {
                        return (
                            (node.nodeType === 8) &&
                            (node.nodeValue.indexOf('ngRepeat:') !== -1)
                        );
                    })[0];

                    if (!ngRepeat) {
                        // Without ng-repeat
                        return function () {
                            return null;
                        };
                    }

                    // tests: http://jsbin.com/kosubutilo/1/edit?js,output
                    ngRepeat = ngRepeat.nodeValue.match(/ngRepeat:\s*(?:\(.*?,\s*)?([^\s)]+)[\s)]+in\s+([^\s|]+)/);

                    var itemsExpr = $parse(ngRepeat[2]);

                    return function () {
                        return itemsExpr(scope.$parent) || [];
                    };
                };


            // Export
            return {
                restrict: 'AC',
                scope: {ngSortable: "=?"},
                link: function (scope, $el) {
                    var el = $el[0],
                        options = angular.extend(scope.ngSortable || {}, ngSortableConfig),
                        watchers = [],
                        getSource = getSourceFactory(el, scope),
                        sortable
                        ;

                    el[expando] = getSource;

                    function _emitEvent(/**Event*/evt, /*Mixed*/item) {
                        var name = 'on' + evt.type.charAt(0).toUpperCase() + evt.type.substr(1);
                        var source = getSource();

                        /* jshint expr:true */
                        options[name] && options[name]({
                            model: item || source[evt.newIndex],
                            models: source,
                            oldIndex: evt.oldIndex,
                            newIndex: evt.newIndex
                        });
                    }


                    function _sync(/**Event*/evt) {
                        var items = getSource();

                        if (!items) {
                            // Without ng-repeat
                            return;
                        }

                        var oldIndex = evt.oldIndex,
                            newIndex = evt.newIndex;

                        if (el !== evt.from) {
                            var prevItems = evt.from[expando]();

                            removed = prevItems[oldIndex];

                            if (evt.clone) {
                                removed = angular.copy(removed);
                                prevItems.splice(Sortable.utils.index(evt.clone), 0, prevItems.splice(oldIndex, 1)[0]);
                                evt.from.removeChild(evt.clone);
                            }
                            else {
                                prevItems.splice(oldIndex, 1);
                            }

                            items.splice(newIndex, 0, removed);

                            evt.from.insertBefore(evt.item, nextSibling); // revert element
                        }
                        else {
                            items.splice(newIndex, 0, items.splice(oldIndex, 1)[0]);
                        }

                        scope.$apply();
                    }


                    sortable = Sortable.create(el, Object.keys(options).reduce(function (opts, name) {
                        opts[name] = opts[name] || options[name];
                        return opts;
                    }, {
                        onStart: function (/**Event*/evt) {
                            nextSibling = evt.from === evt.item.parentNode ? evt.item.nextSibling : evt.clone.nextSibling;
                            _emitEvent(evt);
                            scope.$apply();
                        },
                        onEnd: function (/**Event*/evt) {
                            _emitEvent(evt, removed);
                            scope.$apply();
                        },
                        onAdd: function (/**Event*/evt) {
                            _sync(evt);
                            _emitEvent(evt, removed);
                            scope.$apply();
                        },
                        onUpdate: function (/**Event*/evt) {
                            _sync(evt);
                            _emitEvent(evt);
                        },
                        onRemove: function (/**Event*/evt) {
                            _emitEvent(evt, removed);
                        },
                        onSort: function (/**Event*/evt) {
                            _emitEvent(evt);
                        }
                    }));

                    $el.on('$destroy', function () {
                        angular.forEach(watchers, function (/** Function */unwatch) {
                            unwatch();
                        });

                        sortable.destroy();

                        el[expando] = null;
                        el = null;
                        watchers = null;
                        sortable = null;
                        nextSibling = null;
                    });

                    angular.forEach([
                        'sort', 'disabled', 'draggable', 'handle', 'animation', 'group', 'ghostClass', 'filter',
                        'onStart', 'onEnd', 'onAdd', 'onUpdate', 'onRemove', 'onSort'
                    ], function (name) {
                        watchers.push(scope.$watch('ngSortable.' + name, function (value) {
                            if (value !== void 0) {
                                options[name] = value;

                                if (!/^on[A-Z]/.test(name)) {
                                    sortable.option(name, value);
                                }
                            }
                        }));
                    });
                }
            };
        }]);
});

MathJax.Hub.Configured();

var app = angular.module('TLA_ADMIN',
    ['xeditable', 'ui.bootstrap.datetimepicker', 'eehNavigation', 'ui.router', 'ngDialog',
        'ncy-angular-breadcrumb', 'cgBusy', 'ui.bootstrap', 'ui.router.tabs', 'ngFileUpload',
        'cgNotify', 'ngMessages', 'ui.tinymce', 'bootstrapLightbox', 'ng-sortable', 'pascalprecht.translate', 'angular-humanize', 'ngSanitize', 'ui.select', 'ui-notification'])
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
    }).
    filter('isEmpty', function () {
        var bar;
        return function (obj) {
            for (bar in obj) {
                if (obj.hasOwnProperty(bar)) {
                    return false;
                }
            }
            return true;
        };
    })
    .filter('rangeFilter', function() {
        return function( items, rangeInfo ) {
            var filtered = [];
            var min = parseInt(rangeInfo.userMin);
            var max = parseInt(rangeInfo.userMax);
            // If time is with the range
            angular.forEach(items, function(item) {
                if( item.time >= min && item.time <= max ) {
                    filtered.push(item);
                }
            });
            return filtered;
        };
    })
    .directive('ngQuestionsSection', function () {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                sections: '=',
            },
            templateUrl: '/templates/question/section.tpl.html',
        }
    }).config(['eehNavigationProvider', function (eehNavigationProvider) {
        eehNavigationProvider.iconBaseClass("");
        eehNavigationProvider
            .menuItem('myMenu.home', {
                text: 'Home',
                iconClass: 'fa fa-home',
                weight: -10,
                state: 'home-page',
            })
            .menuItem('myMenu.exams', {
                text: 'Exam types',
                iconClass: 'fa fa-list',
                weight: -8,
                state: 'examIndex'
            })
            .menuItem('myMenu.videos', {
                text: 'Videos',
                iconClass: 'fa fa-file-video-o',
                weight: -8,
                state: 'videos'
            })
            .menuItem('myMenu.users', {
                text: 'Users',
                iconClass: 'fa fa-users',
                weight: -6,
                state: 'users',
                isVisible: isAdmin
            })
            .menuItem('myMenu.admins', {
                text: 'Admins',
                iconClass: 'fa fa-users',
                weight: -6,
                state: 'admins',
                isVisible: isAdmin
            })
            .menuItem('myMenu.cms', {
                text: 'CMS',
                iconClass: 'fa fa-file-text-o',
                weight: -4,
                state: 'cms',
                isVisible: isAdmin
            })
            .menuItem('myMenu.settings', {
                text: 'Settings',
                iconClass: 'fa fa-cog'
            })
            .menuItem('myMenu.logout', {
                text: 'Logout',
                iconClass: 'fa fa-sign-out',
                href: 'site/logout'
            })
            .menuItem('myMenu.settings.system', {
                text: 'System settings',
                iconClass: 'fa fa-cogs',
                state: 'system-settings',
                isVisible: isAdmin
            })
            .menuItem('myMenu.settings.profile', {
                text: 'Profile settings',
                iconClass: 'fa fa-cogs',
                state: 'profile-settings'
            });

    }]).run(function ($rootScope, $http, ENDPOINT_URI, Notification) {
        $http.get(ENDPOINT_URI + 'system-settings').then(function (result) {
            $rootScope.system = {
                'settings': result.data[0]
                    ? result.data[0]
                    : {
                    'amount_per_student': '',
                    'student_monthly_amount': '',
                    'recurring_period': '',
                    'payment_enabled': ''
                },
                save_settings: function () {
                    $http.put(ENDPOINT_URI + 'system-settings/update', this.settings).then(function() {
                        Notification.success({
                            message: 'Students subscription settings was saved',
                            title: 'Students subscription settings'
                        });
                    });
                }
            };
        })
    });

