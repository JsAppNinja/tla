/**
 * Created by supostat on 10.11.15.
 */
/**
 * Rangy, a cross-browser JavaScript range and selection library
 * https://github.com/timdown/rangy
 *
 * Copyright 2015, Tim Down
 * Licensed under the MIT license.
 * Version: 1.3.1-dev
 * Build date: 20 May 2015
 */

(function(factory, root) {
    if (typeof define == "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof module != "undefined" && typeof exports == "object") {
        // Node/CommonJS style
        module.exports = factory();
    } else {
        // No AMD or CommonJS support so we place Rangy in (probably) the global variable
        root.rangy = factory();
    }
})(function() {

    var OBJECT = "object", FUNCTION = "function", UNDEFINED = "undefined";

    // Minimal set of properties required for DOM Level 2 Range compliance. Comparison constants such as START_TO_START
    // are omitted because ranges in KHTML do not have them but otherwise work perfectly well. See issue 113.
    var domRangeProperties = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed",
        "commonAncestorContainer"];

    // Minimal set of methods required for DOM Level 2 Range compliance
    var domRangeMethods = ["setStart", "setStartBefore", "setStartAfter", "setEnd", "setEndBefore",
        "setEndAfter", "collapse", "selectNode", "selectNodeContents", "compareBoundaryPoints", "deleteContents",
        "extractContents", "cloneContents", "insertNode", "surroundContents", "cloneRange", "toString", "detach"];

    var textRangeProperties = ["boundingHeight", "boundingLeft", "boundingTop", "boundingWidth", "htmlText", "text"];

    // Subset of TextRange's full set of methods that we're interested in
    var textRangeMethods = ["collapse", "compareEndPoints", "duplicate", "moveToElementText", "parentElement", "select",
        "setEndPoint", "getBoundingClientRect"];

    /*----------------------------------------------------------------------------------------------------------------*/

    // Trio of functions taken from Peter Michaux's article:
    // http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
    function isHostMethod(o, p) {
        var t = typeof o[p];
        return t == FUNCTION || (!!(t == OBJECT && o[p])) || t == "unknown";
    }

    function isHostObject(o, p) {
        return !!(typeof o[p] == OBJECT && o[p]);
    }

    function isHostProperty(o, p) {
        return typeof o[p] != UNDEFINED;
    }

    // Creates a convenience function to save verbose repeated calls to tests functions
    function createMultiplePropertyTest(testFunc) {
        return function(o, props) {
            var i = props.length;
            while (i--) {
                if (!testFunc(o, props[i])) {
                    return false;
                }
            }
            return true;
        };
    }

    // Next trio of functions are a convenience to save verbose repeated calls to previous two functions
    var areHostMethods = createMultiplePropertyTest(isHostMethod);
    var areHostObjects = createMultiplePropertyTest(isHostObject);
    var areHostProperties = createMultiplePropertyTest(isHostProperty);

    function isTextRange(range) {
        return range && areHostMethods(range, textRangeMethods) && areHostProperties(range, textRangeProperties);
    }

    function getBody(doc) {
        return isHostObject(doc, "body") ? doc.body : doc.getElementsByTagName("body")[0];
    }

    var forEach = [].forEach ?
        function(arr, func) {
            arr.forEach(func);
        } :
        function(arr, func) {
            for (var i = 0, len = arr.length; i < len; ++i) {
                func(arr[i], i);
            }
        };

    var modules = {};

    var isBrowser = (typeof window != UNDEFINED && typeof document != UNDEFINED);

    var util = {
        isHostMethod: isHostMethod,
        isHostObject: isHostObject,
        isHostProperty: isHostProperty,
        areHostMethods: areHostMethods,
        areHostObjects: areHostObjects,
        areHostProperties: areHostProperties,
        isTextRange: isTextRange,
        getBody: getBody,
        forEach: forEach
    };

    var api = {
        version: "1.3.1-dev",
        initialized: false,
        isBrowser: isBrowser,
        supported: true,
        util: util,
        features: {},
        modules: modules,
        config: {
            alertOnFail: false,
            alertOnWarn: false,
            preferTextRange: false,
            autoInitialize: (typeof rangyAutoInitialize == UNDEFINED) ? true : rangyAutoInitialize
        }
    };

    function consoleLog(msg) {
        if (typeof console != UNDEFINED && isHostMethod(console, "log")) {
            console.log(msg);
        }
    }

    function alertOrLog(msg, shouldAlert) {
        if (isBrowser && shouldAlert) {
            alert(msg);
        } else  {
            consoleLog(msg);
        }
    }

    function fail(reason) {
        api.initialized = true;
        api.supported = false;
        alertOrLog("Rangy is not supported in this environment. Reason: " + reason, api.config.alertOnFail);
    }

    api.fail = fail;

    function warn(msg) {
        alertOrLog("Rangy warning: " + msg, api.config.alertOnWarn);
    }

    api.warn = warn;

    // Add utility extend() method
    var extend;
    if ({}.hasOwnProperty) {
        util.extend = extend = function(obj, props, deep) {
            var o, p;
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    o = obj[i];
                    p = props[i];
                    if (deep && o !== null && typeof o == "object" && p !== null && typeof p == "object") {
                        extend(o, p, true);
                    }
                    obj[i] = p;
                }
            }
            // Special case for toString, which does not show up in for...in loops in IE <= 8
            if (props.hasOwnProperty("toString")) {
                obj.toString = props.toString;
            }
            return obj;
        };

        util.createOptions = function(optionsParam, defaults) {
            var options = {};
            extend(options, defaults);
            if (optionsParam) {
                extend(options, optionsParam);
            }
            return options;
        };
    } else {
        fail("hasOwnProperty not supported");
    }

    // Test whether we're in a browser and bail out if not
    if (!isBrowser) {
        fail("Rangy can only run in a browser");
    }

    // Test whether Array.prototype.slice can be relied on for NodeLists and use an alternative toArray() if not
    (function() {
        var toArray;

        if (isBrowser) {
            var el = document.createElement("div");
            el.appendChild(document.createElement("span"));
            var slice = [].slice;
            try {
                if (slice.call(el.childNodes, 0)[0].nodeType == 1) {
                    toArray = function(arrayLike) {
                        return slice.call(arrayLike, 0);
                    };
                }
            } catch (e) {}
        }

        if (!toArray) {
            toArray = function(arrayLike) {
                var arr = [];
                for (var i = 0, len = arrayLike.length; i < len; ++i) {
                    arr[i] = arrayLike[i];
                }
                return arr;
            };
        }

        util.toArray = toArray;
    })();

    // Very simple event handler wrapper function that doesn't attempt to solve issues such as "this" handling or
    // normalization of event properties
    var addListener;
    if (isBrowser) {
        if (isHostMethod(document, "addEventListener")) {
            addListener = function(obj, eventType, listener) {
                obj.addEventListener(eventType, listener, false);
            };
        } else if (isHostMethod(document, "attachEvent")) {
            addListener = function(obj, eventType, listener) {
                obj.attachEvent("on" + eventType, listener);
            };
        } else {
            fail("Document does not have required addEventListener or attachEvent method");
        }

        util.addListener = addListener;
    }

    var initListeners = [];

    function getErrorDesc(ex) {
        return ex.message || ex.description || String(ex);
    }

    // Initialization
    function init() {
        if (!isBrowser || api.initialized) {
            return;
        }
        var testRange;
        var implementsDomRange = false, implementsTextRange = false;

        // First, perform basic feature tests

        if (isHostMethod(document, "createRange")) {
            testRange = document.createRange();
            if (areHostMethods(testRange, domRangeMethods) && areHostProperties(testRange, domRangeProperties)) {
                implementsDomRange = true;
            }
        }

        var body = getBody(document);
        if (!body || body.nodeName.toLowerCase() != "body") {
            fail("No body element found");
            return;
        }

        if (body && isHostMethod(body, "createTextRange")) {
            testRange = body.createTextRange();
            if (isTextRange(testRange)) {
                implementsTextRange = true;
            }
        }

        if (!implementsDomRange && !implementsTextRange) {
            fail("Neither Range nor TextRange are available");
            return;
        }

        api.initialized = true;
        api.features = {
            implementsDomRange: implementsDomRange,
            implementsTextRange: implementsTextRange
        };

        // Initialize modules
        var module, errorMessage;
        for (var moduleName in modules) {
            if ( (module = modules[moduleName]) instanceof Module ) {
                module.init(module, api);
            }
        }

        // Call init listeners
        for (var i = 0, len = initListeners.length; i < len; ++i) {
            try {
                initListeners[i](api);
            } catch (ex) {
                errorMessage = "Rangy init listener threw an exception. Continuing. Detail: " + getErrorDesc(ex);
                consoleLog(errorMessage);
            }
        }
    }

    function deprecationNotice(deprecated, replacement, module) {
        if (module) {
            deprecated += " in module " + module.name;
        }
        api.warn("DEPRECATED: " + deprecated + " is deprecated. Please use " +
            replacement + " instead.");
    }

    function createAliasForDeprecatedMethod(owner, deprecated, replacement, module) {
        owner[deprecated] = function() {
            deprecationNotice(deprecated, replacement, module);
            return owner[replacement].apply(owner, util.toArray(arguments));
        };
    }

    util.deprecationNotice = deprecationNotice;
    util.createAliasForDeprecatedMethod = createAliasForDeprecatedMethod;

    // Allow external scripts to initialize this library in case it's loaded after the document has loaded
    api.init = init;

    // Execute listener immediately if already initialized
    api.addInitListener = function(listener) {
        if (api.initialized) {
            listener(api);
        } else {
            initListeners.push(listener);
        }
    };

    var shimListeners = [];

    api.addShimListener = function(listener) {
        shimListeners.push(listener);
    };

    function shim(win) {
        win = win || window;
        init();

        // Notify listeners
        for (var i = 0, len = shimListeners.length; i < len; ++i) {
            shimListeners[i](win);
        }
    }

    if (isBrowser) {
        api.shim = api.createMissingNativeApi = shim;
        createAliasForDeprecatedMethod(api, "createMissingNativeApi", "shim");
    }

    function Module(name, dependencies, initializer) {
        this.name = name;
        this.dependencies = dependencies;
        this.initialized = false;
        this.supported = false;
        this.initializer = initializer;
    }

    Module.prototype = {
        init: function() {
            var requiredModuleNames = this.dependencies || [];
            for (var i = 0, len = requiredModuleNames.length, requiredModule, moduleName; i < len; ++i) {
                moduleName = requiredModuleNames[i];

                requiredModule = modules[moduleName];
                if (!requiredModule || !(requiredModule instanceof Module)) {
                    throw new Error("required module '" + moduleName + "' not found");
                }

                requiredModule.init();

                if (!requiredModule.supported) {
                    throw new Error("required module '" + moduleName + "' not supported");
                }
            }

            // Now run initializer
            this.initializer(this);
        },

        fail: function(reason) {
            this.initialized = true;
            this.supported = false;
            throw new Error(reason);
        },

        warn: function(msg) {
            api.warn("Module " + this.name + ": " + msg);
        },

        deprecationNotice: function(deprecated, replacement) {
            api.warn("DEPRECATED: " + deprecated + " in module " + this.name + " is deprecated. Please use " +
                replacement + " instead");
        },

        createError: function(msg) {
            return new Error("Error in Rangy " + this.name + " module: " + msg);
        }
    };

    function createModule(name, dependencies, initFunc) {
        var newModule = new Module(name, dependencies, function(module) {
            if (!module.initialized) {
                module.initialized = true;
                try {
                    initFunc(api, module);
                    module.supported = true;
                } catch (ex) {
                    var errorMessage = "Module '" + name + "' failed to load: " + getErrorDesc(ex);
                    consoleLog(errorMessage);
                    if (ex.stack) {
                        consoleLog(ex.stack);
                    }
                }
            }
        });
        modules[name] = newModule;
        return newModule;
    }

    api.createModule = function(name) {
        // Allow 2 or 3 arguments (second argument is an optional array of dependencies)
        var initFunc, dependencies;
        if (arguments.length == 2) {
            initFunc = arguments[1];
            dependencies = [];
        } else {
            initFunc = arguments[2];
            dependencies = arguments[1];
        }

        var module = createModule(name, dependencies, initFunc);

        // Initialize the module immediately if the core is already initialized
        if (api.initialized && api.supported) {
            module.init();
        }
    };

    api.createCoreModule = function(name, dependencies, initFunc) {
        createModule(name, dependencies, initFunc);
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    // Ensure rangy.rangePrototype and rangy.selectionPrototype are available immediately

    function RangePrototype() {}
    api.RangePrototype = RangePrototype;
    api.rangePrototype = new RangePrototype();

    function SelectionPrototype() {}
    api.selectionPrototype = new SelectionPrototype();

    /*----------------------------------------------------------------------------------------------------------------*/

    // DOM utility methods used by Rangy
    api.createCoreModule("DomUtil", [], function(api, module) {
        var UNDEF = "undefined";
        var util = api.util;
        var getBody = util.getBody;

        // Perform feature tests
        if (!util.areHostMethods(document, ["createDocumentFragment", "createElement", "createTextNode"])) {
            module.fail("document missing a Node creation method");
        }

        if (!util.isHostMethod(document, "getElementsByTagName")) {
            module.fail("document missing getElementsByTagName method");
        }

        var el = document.createElement("div");
        if (!util.areHostMethods(el, ["insertBefore", "appendChild", "cloneNode"] ||
                !util.areHostObjects(el, ["previousSibling", "nextSibling", "childNodes", "parentNode"]))) {
            module.fail("Incomplete Element implementation");
        }

        // innerHTML is required for Range's createContextualFragment method
        if (!util.isHostProperty(el, "innerHTML")) {
            module.fail("Element is missing innerHTML property");
        }

        var textNode = document.createTextNode("test");
        if (!util.areHostMethods(textNode, ["splitText", "deleteData", "insertData", "appendData", "cloneNode"] ||
                !util.areHostObjects(el, ["previousSibling", "nextSibling", "childNodes", "parentNode"]) ||
                !util.areHostProperties(textNode, ["data"]))) {
            module.fail("Incomplete Text Node implementation");
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Removed use of indexOf because of a bizarre bug in Opera that is thrown in one of the Acid3 tests. I haven't been
        // able to replicate it outside of the test. The bug is that indexOf returns -1 when called on an Array that
        // contains just the document as a single element and the value searched for is the document.
        var arrayContains = /*Array.prototype.indexOf ?
         function(arr, val) {
         return arr.indexOf(val) > -1;
         }:*/

            function(arr, val) {
                var i = arr.length;
                while (i--) {
                    if (arr[i] === val) {
                        return true;
                    }
                }
                return false;
            };

        // Opera 11 puts HTML elements in the null namespace, it seems, and IE 7 has undefined namespaceURI
        function isHtmlNamespace(node) {
            var ns;
            return typeof node.namespaceURI == UNDEF || ((ns = node.namespaceURI) === null || ns == "http://www.w3.org/1999/xhtml");
        }

        function parentElement(node) {
            var parent = node.parentNode;
            return (parent.nodeType == 1) ? parent : null;
        }

        function getNodeIndex(node) {
            var i = 0;
            while( (node = node.previousSibling) ) {
                ++i;
            }
            return i;
        }

        function getNodeLength(node) {
            switch (node.nodeType) {
                case 7:
                case 10:
                    return 0;
                case 3:
                case 8:
                    return node.length;
                default:
                    return node.childNodes.length;
            }
        }

        function getCommonAncestor(node1, node2) {
            var ancestors = [], n;
            for (n = node1; n; n = n.parentNode) {
                ancestors.push(n);
            }

            for (n = node2; n; n = n.parentNode) {
                if (arrayContains(ancestors, n)) {
                    return n;
                }
            }

            return null;
        }

        function isAncestorOf(ancestor, descendant, selfIsAncestor) {
            var n = selfIsAncestor ? descendant : descendant.parentNode;
            while (n) {
                if (n === ancestor) {
                    return true;
                } else {
                    n = n.parentNode;
                }
            }
            return false;
        }

        function isOrIsAncestorOf(ancestor, descendant) {
            return isAncestorOf(ancestor, descendant, true);
        }

        function getClosestAncestorIn(node, ancestor, selfIsAncestor) {
            var p, n = selfIsAncestor ? node : node.parentNode;
            while (n) {
                p = n.parentNode;
                if (p === ancestor) {
                    return n;
                }
                n = p;
            }
            return null;
        }

        function isCharacterDataNode(node) {
            var t = node.nodeType;
            return t == 3 || t == 4 || t == 8 ; // Text, CDataSection or Comment
        }

        function isTextOrCommentNode(node) {
            if (!node) {
                return false;
            }
            var t = node.nodeType;
            return t == 3 || t == 8 ; // Text or Comment
        }

        function insertAfter(node, precedingNode) {
            var nextNode = precedingNode.nextSibling, parent = precedingNode.parentNode;
            if (nextNode) {
                parent.insertBefore(node, nextNode);
            } else {
                parent.appendChild(node);
            }
            return node;
        }

        // Note that we cannot use splitText() because it is bugridden in IE 9.
        function splitDataNode(node, index, positionsToPreserve) {
            var newNode = node.cloneNode(false);
            newNode.deleteData(0, index);
            node.deleteData(index, node.length - index);
            insertAfter(newNode, node);

            // Preserve positions
            if (positionsToPreserve) {
                for (var i = 0, position; position = positionsToPreserve[i++]; ) {
                    // Handle case where position was inside the portion of node after the split point
                    if (position.node == node && position.offset > index) {
                        position.node = newNode;
                        position.offset -= index;
                    }
                    // Handle the case where the position is a node offset within node's parent
                    else if (position.node == node.parentNode && position.offset > getNodeIndex(node)) {
                        ++position.offset;
                    }
                }
            }
            return newNode;
        }

        function getDocument(node) {
            if (node.nodeType == 9) {
                return node;
            } else if (typeof node.ownerDocument != UNDEF) {
                return node.ownerDocument;
            } else if (typeof node.document != UNDEF) {
                return node.document;
            } else if (node.parentNode) {
                return getDocument(node.parentNode);
            } else {
                throw module.createError("getDocument: no document found for node");
            }
        }

        function getWindow(node) {
            var doc = getDocument(node);
            if (typeof doc.defaultView != UNDEF) {
                return doc.defaultView;
            } else if (typeof doc.parentWindow != UNDEF) {
                return doc.parentWindow;
            } else {
                throw module.createError("Cannot get a window object for node");
            }
        }

        function getIframeDocument(iframeEl) {
            if (typeof iframeEl.contentDocument != UNDEF) {
                return iframeEl.contentDocument;
            } else if (typeof iframeEl.contentWindow != UNDEF) {
                return iframeEl.contentWindow.document;
            } else {
                throw module.createError("getIframeDocument: No Document object found for iframe element");
            }
        }

        function getIframeWindow(iframeEl) {
            if (typeof iframeEl.contentWindow != UNDEF) {
                return iframeEl.contentWindow;
            } else if (typeof iframeEl.contentDocument != UNDEF) {
                return iframeEl.contentDocument.defaultView;
            } else {
                throw module.createError("getIframeWindow: No Window object found for iframe element");
            }
        }

        // This looks bad. Is it worth it?
        function isWindow(obj) {
            return obj && util.isHostMethod(obj, "setTimeout") && util.isHostObject(obj, "document");
        }

        function getContentDocument(obj, module, methodName) {
            var doc;

            if (!obj) {
                doc = document;
            }

            // Test if a DOM node has been passed and obtain a document object for it if so
            else if (util.isHostProperty(obj, "nodeType")) {
                doc = (obj.nodeType == 1 && obj.tagName.toLowerCase() == "iframe") ?
                    getIframeDocument(obj) : getDocument(obj);
            }

            // Test if the doc parameter appears to be a Window object
            else if (isWindow(obj)) {
                doc = obj.document;
            }

            if (!doc) {
                throw module.createError(methodName + "(): Parameter must be a Window object or DOM node");
            }

            return doc;
        }

        function getRootContainer(node) {
            var parent;
            while ( (parent = node.parentNode) ) {
                node = parent;
            }
            return node;
        }

        function comparePoints(nodeA, offsetA, nodeB, offsetB) {
            // See http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Comparing
            var nodeC, root, childA, childB, n;
            if (nodeA == nodeB) {
                // Case 1: nodes are the same
                return offsetA === offsetB ? 0 : (offsetA < offsetB) ? -1 : 1;
            } else if ( (nodeC = getClosestAncestorIn(nodeB, nodeA, true)) ) {
                // Case 2: node C (container B or an ancestor) is a child node of A
                return offsetA <= getNodeIndex(nodeC) ? -1 : 1;
            } else if ( (nodeC = getClosestAncestorIn(nodeA, nodeB, true)) ) {
                // Case 3: node C (container A or an ancestor) is a child node of B
                return getNodeIndex(nodeC) < offsetB  ? -1 : 1;
            } else {
                root = getCommonAncestor(nodeA, nodeB);
                if (!root) {
                    throw new Error("comparePoints error: nodes have no common ancestor");
                }

                // Case 4: containers are siblings or descendants of siblings
                childA = (nodeA === root) ? root : getClosestAncestorIn(nodeA, root, true);
                childB = (nodeB === root) ? root : getClosestAncestorIn(nodeB, root, true);

                if (childA === childB) {
                    // This shouldn't be possible
                    throw module.createError("comparePoints got to case 4 and childA and childB are the same!");
                } else {
                    n = root.firstChild;
                    while (n) {
                        if (n === childA) {
                            return -1;
                        } else if (n === childB) {
                            return 1;
                        }
                        n = n.nextSibling;
                    }
                }
            }
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Test for IE's crash (IE 6/7) or exception (IE >= 8) when a reference to garbage-collected text node is queried
        var crashyTextNodes = false;

        function isBrokenNode(node) {
            var n;
            try {
                n = node.parentNode;
                return false;
            } catch (e) {
                return true;
            }
        }

        (function() {
            var el = document.createElement("b");
            el.innerHTML = "1";
            var textNode = el.firstChild;
            el.innerHTML = "<br />";
            crashyTextNodes = isBrokenNode(textNode);

            api.features.crashyTextNodes = crashyTextNodes;
        })();

        /*----------------------------------------------------------------------------------------------------------------*/

        function inspectNode(node) {
            if (!node) {
                return "[No node]";
            }
            if (crashyTextNodes && isBrokenNode(node)) {
                return "[Broken node]";
            }
            if (isCharacterDataNode(node)) {
                return '"' + node.data + '"';
            }
            if (node.nodeType == 1) {
                var idAttr = node.id ? ' id="' + node.id + '"' : "";
                return "<" + node.nodeName + idAttr + ">[index:" + getNodeIndex(node) + ",length:" + node.childNodes.length + "][" + (node.innerHTML || "[innerHTML not supported]").slice(0, 25) + "]";
            }
            return node.nodeName;
        }

        function fragmentFromNodeChildren(node) {
            var fragment = getDocument(node).createDocumentFragment(), child;
            while ( (child = node.firstChild) ) {
                fragment.appendChild(child);
            }
            return fragment;
        }

        var getComputedStyleProperty;
        if (typeof window.getComputedStyle != UNDEF) {
            getComputedStyleProperty = function(el, propName) {
                return getWindow(el).getComputedStyle(el, null)[propName];
            };
        } else if (typeof document.documentElement.currentStyle != UNDEF) {
            getComputedStyleProperty = function(el, propName) {
                return el.currentStyle ? el.currentStyle[propName] : "";
            };
        } else {
            module.fail("No means of obtaining computed style properties found");
        }

        function createTestElement(doc, html, contentEditable) {
            var body = getBody(doc);
            var el = doc.createElement("div");
            el.contentEditable = "" + !!contentEditable;
            if (html) {
                el.innerHTML = html;
            }

            // Insert the test element at the start of the body to prevent scrolling to the bottom in iOS (issue #292)
            var bodyFirstChild = body.firstChild;
            if (bodyFirstChild) {
                body.insertBefore(el, bodyFirstChild);
            } else {
                body.appendChild(el);
            }

            return el;
        }

        function removeNode(node) {
            return node.parentNode.removeChild(node);
        }

        function NodeIterator(root) {
            this.root = root;
            this._next = root;
        }

        NodeIterator.prototype = {
            _current: null,

            hasNext: function() {
                return !!this._next;
            },

            next: function() {
                var n = this._current = this._next;
                var child, next;
                if (this._current) {
                    child = n.firstChild;
                    if (child) {
                        this._next = child;
                    } else {
                        next = null;
                        while ((n !== this.root) && !(next = n.nextSibling)) {
                            n = n.parentNode;
                        }
                        this._next = next;
                    }
                }
                return this._current;
            },

            detach: function() {
                this._current = this._next = this.root = null;
            }
        };

        function createIterator(root) {
            return new NodeIterator(root);
        }

        function DomPosition(node, offset) {
            this.node = node;
            this.offset = offset;
        }

        DomPosition.prototype = {
            equals: function(pos) {
                return !!pos && this.node === pos.node && this.offset == pos.offset;
            },

            inspect: function() {
                return "[DomPosition(" + inspectNode(this.node) + ":" + this.offset + ")]";
            },

            toString: function() {
                return this.inspect();
            }
        };

        function DOMException(codeName) {
            this.code = this[codeName];
            this.codeName = codeName;
            this.message = "DOMException: " + this.codeName;
        }

        DOMException.prototype = {
            INDEX_SIZE_ERR: 1,
            HIERARCHY_REQUEST_ERR: 3,
            WRONG_DOCUMENT_ERR: 4,
            NO_MODIFICATION_ALLOWED_ERR: 7,
            NOT_FOUND_ERR: 8,
            NOT_SUPPORTED_ERR: 9,
            INVALID_STATE_ERR: 11,
            INVALID_NODE_TYPE_ERR: 24
        };

        DOMException.prototype.toString = function() {
            return this.message;
        };

        api.dom = {
            arrayContains: arrayContains,
            isHtmlNamespace: isHtmlNamespace,
            parentElement: parentElement,
            getNodeIndex: getNodeIndex,
            getNodeLength: getNodeLength,
            getCommonAncestor: getCommonAncestor,
            isAncestorOf: isAncestorOf,
            isOrIsAncestorOf: isOrIsAncestorOf,
            getClosestAncestorIn: getClosestAncestorIn,
            isCharacterDataNode: isCharacterDataNode,
            isTextOrCommentNode: isTextOrCommentNode,
            insertAfter: insertAfter,
            splitDataNode: splitDataNode,
            getDocument: getDocument,
            getWindow: getWindow,
            getIframeWindow: getIframeWindow,
            getIframeDocument: getIframeDocument,
            getBody: getBody,
            isWindow: isWindow,
            getContentDocument: getContentDocument,
            getRootContainer: getRootContainer,
            comparePoints: comparePoints,
            isBrokenNode: isBrokenNode,
            inspectNode: inspectNode,
            getComputedStyleProperty: getComputedStyleProperty,
            createTestElement: createTestElement,
            removeNode: removeNode,
            fragmentFromNodeChildren: fragmentFromNodeChildren,
            createIterator: createIterator,
            DomPosition: DomPosition
        };

        api.DOMException = DOMException;
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // Pure JavaScript implementation of DOM Range
    api.createCoreModule("DomRange", ["DomUtil"], function(api, module) {
        var dom = api.dom;
        var util = api.util;
        var DomPosition = dom.DomPosition;
        var DOMException = api.DOMException;

        var isCharacterDataNode = dom.isCharacterDataNode;
        var getNodeIndex = dom.getNodeIndex;
        var isOrIsAncestorOf = dom.isOrIsAncestorOf;
        var getDocument = dom.getDocument;
        var comparePoints = dom.comparePoints;
        var splitDataNode = dom.splitDataNode;
        var getClosestAncestorIn = dom.getClosestAncestorIn;
        var getNodeLength = dom.getNodeLength;
        var arrayContains = dom.arrayContains;
        var getRootContainer = dom.getRootContainer;
        var crashyTextNodes = api.features.crashyTextNodes;

        var removeNode = dom.removeNode;

        /*----------------------------------------------------------------------------------------------------------------*/

        // Utility functions

        function isNonTextPartiallySelected(node, range) {
            return (node.nodeType != 3) &&
                (isOrIsAncestorOf(node, range.startContainer) || isOrIsAncestorOf(node, range.endContainer));
        }

        function getRangeDocument(range) {
            return range.document || getDocument(range.startContainer);
        }

        function getRangeRoot(range) {
            return getRootContainer(range.startContainer);
        }

        function getBoundaryBeforeNode(node) {
            return new DomPosition(node.parentNode, getNodeIndex(node));
        }

        function getBoundaryAfterNode(node) {
            return new DomPosition(node.parentNode, getNodeIndex(node) + 1);
        }

        function insertNodeAtPosition(node, n, o) {
            var firstNodeInserted = node.nodeType == 11 ? node.firstChild : node;
            if (isCharacterDataNode(n)) {
                if (o == n.length) {
                    dom.insertAfter(node, n);
                } else {
                    n.parentNode.insertBefore(node, o == 0 ? n : splitDataNode(n, o));
                }
            } else if (o >= n.childNodes.length) {
                n.appendChild(node);
            } else {
                n.insertBefore(node, n.childNodes[o]);
            }
            return firstNodeInserted;
        }

        function rangesIntersect(rangeA, rangeB, touchingIsIntersecting) {
            assertRangeValid(rangeA);
            assertRangeValid(rangeB);

            if (getRangeDocument(rangeB) != getRangeDocument(rangeA)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }

            var startComparison = comparePoints(rangeA.startContainer, rangeA.startOffset, rangeB.endContainer, rangeB.endOffset),
                endComparison = comparePoints(rangeA.endContainer, rangeA.endOffset, rangeB.startContainer, rangeB.startOffset);

            return touchingIsIntersecting ? startComparison <= 0 && endComparison >= 0 : startComparison < 0 && endComparison > 0;
        }

        function cloneSubtree(iterator) {
            var partiallySelected;
            for (var node, frag = getRangeDocument(iterator.range).createDocumentFragment(), subIterator; node = iterator.next(); ) {
                partiallySelected = iterator.isPartiallySelectedSubtree();
                node = node.cloneNode(!partiallySelected);
                if (partiallySelected) {
                    subIterator = iterator.getSubtreeIterator();
                    node.appendChild(cloneSubtree(subIterator));
                    subIterator.detach();
                }

                if (node.nodeType == 10) { // DocumentType
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }
                frag.appendChild(node);
            }
            return frag;
        }

        function iterateSubtree(rangeIterator, func, iteratorState) {
            var it, n;
            iteratorState = iteratorState || { stop: false };
            for (var node, subRangeIterator; node = rangeIterator.next(); ) {
                if (rangeIterator.isPartiallySelectedSubtree()) {
                    if (func(node) === false) {
                        iteratorState.stop = true;
                        return;
                    } else {
                        // The node is partially selected by the Range, so we can use a new RangeIterator on the portion of
                        // the node selected by the Range.
                        subRangeIterator = rangeIterator.getSubtreeIterator();
                        iterateSubtree(subRangeIterator, func, iteratorState);
                        subRangeIterator.detach();
                        if (iteratorState.stop) {
                            return;
                        }
                    }
                } else {
                    // The whole node is selected, so we can use efficient DOM iteration to iterate over the node and its
                    // descendants
                    it = dom.createIterator(node);
                    while ( (n = it.next()) ) {
                        if (func(n) === false) {
                            iteratorState.stop = true;
                            return;
                        }
                    }
                }
            }
        }

        function deleteSubtree(iterator) {
            var subIterator;
            while (iterator.next()) {
                if (iterator.isPartiallySelectedSubtree()) {
                    subIterator = iterator.getSubtreeIterator();
                    deleteSubtree(subIterator);
                    subIterator.detach();
                } else {
                    iterator.remove();
                }
            }
        }

        function extractSubtree(iterator) {
            for (var node, frag = getRangeDocument(iterator.range).createDocumentFragment(), subIterator; node = iterator.next(); ) {

                if (iterator.isPartiallySelectedSubtree()) {
                    node = node.cloneNode(false);
                    subIterator = iterator.getSubtreeIterator();
                    node.appendChild(extractSubtree(subIterator));
                    subIterator.detach();
                } else {
                    iterator.remove();
                }
                if (node.nodeType == 10) { // DocumentType
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }
                frag.appendChild(node);
            }
            return frag;
        }

        function getNodesInRange(range, nodeTypes, filter) {
            var filterNodeTypes = !!(nodeTypes && nodeTypes.length), regex;
            var filterExists = !!filter;
            if (filterNodeTypes) {
                regex = new RegExp("^(" + nodeTypes.join("|") + ")$");
            }

            var nodes = [];
            iterateSubtree(new RangeIterator(range, false), function(node) {
                if (filterNodeTypes && !regex.test(node.nodeType)) {
                    return;
                }
                if (filterExists && !filter(node)) {
                    return;
                }
                // Don't include a boundary container if it is a character data node and the range does not contain any
                // of its character data. See issue 190.
                var sc = range.startContainer;
                if (node == sc && isCharacterDataNode(sc) && range.startOffset == sc.length) {
                    return;
                }

                var ec = range.endContainer;
                if (node == ec && isCharacterDataNode(ec) && range.endOffset == 0) {
                    return;
                }

                nodes.push(node);
            });
            return nodes;
        }

        function inspect(range) {
            var name = (typeof range.getName == "undefined") ? "Range" : range.getName();
            return "[" + name + "(" + dom.inspectNode(range.startContainer) + ":" + range.startOffset + ", " +
                dom.inspectNode(range.endContainer) + ":" + range.endOffset + ")]";
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // RangeIterator code partially borrows from IERange by Tim Ryan (http://github.com/timcameronryan/IERange)

        function RangeIterator(range, clonePartiallySelectedTextNodes) {
            this.range = range;
            this.clonePartiallySelectedTextNodes = clonePartiallySelectedTextNodes;


            if (!range.collapsed) {
                this.sc = range.startContainer;
                this.so = range.startOffset;
                this.ec = range.endContainer;
                this.eo = range.endOffset;
                var root = range.commonAncestorContainer;

                if (this.sc === this.ec && isCharacterDataNode(this.sc)) {
                    this.isSingleCharacterDataNode = true;
                    this._first = this._last = this._next = this.sc;
                } else {
                    this._first = this._next = (this.sc === root && !isCharacterDataNode(this.sc)) ?
                        this.sc.childNodes[this.so] : getClosestAncestorIn(this.sc, root, true);
                    this._last = (this.ec === root && !isCharacterDataNode(this.ec)) ?
                        this.ec.childNodes[this.eo - 1] : getClosestAncestorIn(this.ec, root, true);
                }
            }
        }

        RangeIterator.prototype = {
            _current: null,
            _next: null,
            _first: null,
            _last: null,
            isSingleCharacterDataNode: false,

            reset: function() {
                this._current = null;
                this._next = this._first;
            },

            hasNext: function() {
                return !!this._next;
            },

            next: function() {
                // Move to next node
                var current = this._current = this._next;
                if (current) {
                    this._next = (current !== this._last) ? current.nextSibling : null;

                    // Check for partially selected text nodes
                    if (isCharacterDataNode(current) && this.clonePartiallySelectedTextNodes) {
                        if (current === this.ec) {
                            (current = current.cloneNode(true)).deleteData(this.eo, current.length - this.eo);
                        }
                        if (this._current === this.sc) {
                            (current = current.cloneNode(true)).deleteData(0, this.so);
                        }
                    }
                }

                return current;
            },

            remove: function() {
                var current = this._current, start, end;

                if (isCharacterDataNode(current) && (current === this.sc || current === this.ec)) {
                    start = (current === this.sc) ? this.so : 0;
                    end = (current === this.ec) ? this.eo : current.length;
                    if (start != end) {
                        current.deleteData(start, end - start);
                    }
                } else {
                    if (current.parentNode) {
                        removeNode(current);
                    } else {
                    }
                }
            },

            // Checks if the current node is partially selected
            isPartiallySelectedSubtree: function() {
                var current = this._current;
                return isNonTextPartiallySelected(current, this.range);
            },

            getSubtreeIterator: function() {
                var subRange;
                if (this.isSingleCharacterDataNode) {
                    subRange = this.range.cloneRange();
                    subRange.collapse(false);
                } else {
                    subRange = new Range(getRangeDocument(this.range));
                    var current = this._current;
                    var startContainer = current, startOffset = 0, endContainer = current, endOffset = getNodeLength(current);

                    if (isOrIsAncestorOf(current, this.sc)) {
                        startContainer = this.sc;
                        startOffset = this.so;
                    }
                    if (isOrIsAncestorOf(current, this.ec)) {
                        endContainer = this.ec;
                        endOffset = this.eo;
                    }

                    updateBoundaries(subRange, startContainer, startOffset, endContainer, endOffset);
                }
                return new RangeIterator(subRange, this.clonePartiallySelectedTextNodes);
            },

            detach: function() {
                this.range = this._current = this._next = this._first = this._last = this.sc = this.so = this.ec = this.eo = null;
            }
        };

        /*----------------------------------------------------------------------------------------------------------------*/

        var beforeAfterNodeTypes = [1, 3, 4, 5, 7, 8, 10];
        var rootContainerNodeTypes = [2, 9, 11];
        var readonlyNodeTypes = [5, 6, 10, 12];
        var insertableNodeTypes = [1, 3, 4, 5, 7, 8, 10, 11];
        var surroundNodeTypes = [1, 3, 4, 5, 7, 8];

        function createAncestorFinder(nodeTypes) {
            return function(node, selfIsAncestor) {
                var t, n = selfIsAncestor ? node : node.parentNode;
                while (n) {
                    t = n.nodeType;
                    if (arrayContains(nodeTypes, t)) {
                        return n;
                    }
                    n = n.parentNode;
                }
                return null;
            };
        }

        var getDocumentOrFragmentContainer = createAncestorFinder( [9, 11] );
        var getReadonlyAncestor = createAncestorFinder(readonlyNodeTypes);
        var getDocTypeNotationEntityAncestor = createAncestorFinder( [6, 10, 12] );

        function assertNoDocTypeNotationEntityAncestor(node, allowSelf) {
            if (getDocTypeNotationEntityAncestor(node, allowSelf)) {
                throw new DOMException("INVALID_NODE_TYPE_ERR");
            }
        }

        function assertValidNodeType(node, invalidTypes) {
            if (!arrayContains(invalidTypes, node.nodeType)) {
                throw new DOMException("INVALID_NODE_TYPE_ERR");
            }
        }

        function assertValidOffset(node, offset) {
            if (offset < 0 || offset > (isCharacterDataNode(node) ? node.length : node.childNodes.length)) {
                throw new DOMException("INDEX_SIZE_ERR");
            }
        }

        function assertSameDocumentOrFragment(node1, node2) {
            if (getDocumentOrFragmentContainer(node1, true) !== getDocumentOrFragmentContainer(node2, true)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }
        }

        function assertNodeNotReadOnly(node) {
            if (getReadonlyAncestor(node, true)) {
                throw new DOMException("NO_MODIFICATION_ALLOWED_ERR");
            }
        }

        function assertNode(node, codeName) {
            if (!node) {
                throw new DOMException(codeName);
            }
        }

        function isValidOffset(node, offset) {
            return offset <= (isCharacterDataNode(node) ? node.length : node.childNodes.length);
        }

        function isRangeValid(range) {
            return (!!range.startContainer && !!range.endContainer &&
            !(crashyTextNodes && (dom.isBrokenNode(range.startContainer) || dom.isBrokenNode(range.endContainer))) &&
            getRootContainer(range.startContainer) == getRootContainer(range.endContainer) &&
            isValidOffset(range.startContainer, range.startOffset) &&
            isValidOffset(range.endContainer, range.endOffset));
        }

        function assertRangeValid(range) {
            if (!isRangeValid(range)) {
                throw new Error("Range error: Range is not valid. This usually happens after DOM mutation. Range: (" + range.inspect() + ")");
            }
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Test the browser's innerHTML support to decide how to implement createContextualFragment
        var styleEl = document.createElement("style");
        var htmlParsingConforms = false;
        try {
            styleEl.innerHTML = "<b>x</b>";
            htmlParsingConforms = (styleEl.firstChild.nodeType == 3); // Opera incorrectly creates an element node
        } catch (e) {
            // IE 6 and 7 throw
        }

        api.features.htmlParsingConforms = htmlParsingConforms;

        var createContextualFragment = htmlParsingConforms ?

            // Implementation as per HTML parsing spec, trusting in the browser's implementation of innerHTML. See
            // discussion and base code for this implementation at issue 67.
            // Spec: http://html5.org/specs/dom-parsing.html#extensions-to-the-range-interface
            // Thanks to Aleks Williams.
            function(fragmentStr) {
                // "Let node the context object's start's node."
                var node = this.startContainer;
                var doc = getDocument(node);

                // "If the context object's start's node is null, raise an INVALID_STATE_ERR
                // exception and abort these steps."
                if (!node) {
                    throw new DOMException("INVALID_STATE_ERR");
                }

                // "Let element be as follows, depending on node's interface:"
                // Document, Document Fragment: null
                var el = null;

                // "Element: node"
                if (node.nodeType == 1) {
                    el = node;

                    // "Text, Comment: node's parentElement"
                } else if (isCharacterDataNode(node)) {
                    el = dom.parentElement(node);
                }

                // "If either element is null or element's ownerDocument is an HTML document
                // and element's local name is "html" and element's namespace is the HTML
                // namespace"
                if (el === null || (
                        el.nodeName == "HTML" &&
                        dom.isHtmlNamespace(getDocument(el).documentElement) &&
                        dom.isHtmlNamespace(el)
                    )) {

                    // "let element be a new Element with "body" as its local name and the HTML
                    // namespace as its namespace.""
                    el = doc.createElement("body");
                } else {
                    el = el.cloneNode(false);
                }

                // "If the node's document is an HTML document: Invoke the HTML fragment parsing algorithm."
                // "If the node's document is an XML document: Invoke the XML fragment parsing algorithm."
                // "In either case, the algorithm must be invoked with fragment as the input
                // and element as the context element."
                el.innerHTML = fragmentStr;

                // "If this raises an exception, then abort these steps. Otherwise, let new
                // children be the nodes returned."

                // "Let fragment be a new DocumentFragment."
                // "Append all new children to fragment."
                // "Return fragment."
                return dom.fragmentFromNodeChildren(el);
            } :

            // In this case, innerHTML cannot be trusted, so fall back to a simpler, non-conformant implementation that
            // previous versions of Rangy used (with the exception of using a body element rather than a div)
            function(fragmentStr) {
                var doc = getRangeDocument(this);
                var el = doc.createElement("body");
                el.innerHTML = fragmentStr;

                return dom.fragmentFromNodeChildren(el);
            };

        function splitRangeBoundaries(range, positionsToPreserve) {
            assertRangeValid(range);

            var sc = range.startContainer, so = range.startOffset, ec = range.endContainer, eo = range.endOffset;
            var startEndSame = (sc === ec);

            if (isCharacterDataNode(ec) && eo > 0 && eo < ec.length) {
                splitDataNode(ec, eo, positionsToPreserve);
            }

            if (isCharacterDataNode(sc) && so > 0 && so < sc.length) {
                sc = splitDataNode(sc, so, positionsToPreserve);
                if (startEndSame) {
                    eo -= so;
                    ec = sc;
                } else if (ec == sc.parentNode && eo >= getNodeIndex(sc)) {
                    eo++;
                }
                so = 0;
            }
            range.setStartAndEnd(sc, so, ec, eo);
        }

        function rangeToHtml(range) {
            assertRangeValid(range);
            var container = range.commonAncestorContainer.parentNode.cloneNode(false);
            container.appendChild( range.cloneContents() );
            return container.innerHTML;
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        var rangeProperties = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed",
            "commonAncestorContainer"];

        var s2s = 0, s2e = 1, e2e = 2, e2s = 3;
        var n_b = 0, n_a = 1, n_b_a = 2, n_i = 3;

        util.extend(api.rangePrototype, {
            compareBoundaryPoints: function(how, range) {
                assertRangeValid(this);
                assertSameDocumentOrFragment(this.startContainer, range.startContainer);

                var nodeA, offsetA, nodeB, offsetB;
                var prefixA = (how == e2s || how == s2s) ? "start" : "end";
                var prefixB = (how == s2e || how == s2s) ? "start" : "end";
                nodeA = this[prefixA + "Container"];
                offsetA = this[prefixA + "Offset"];
                nodeB = range[prefixB + "Container"];
                offsetB = range[prefixB + "Offset"];
                return comparePoints(nodeA, offsetA, nodeB, offsetB);
            },

            insertNode: function(node) {
                assertRangeValid(this);
                assertValidNodeType(node, insertableNodeTypes);
                assertNodeNotReadOnly(this.startContainer);

                if (isOrIsAncestorOf(node, this.startContainer)) {
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }

                // No check for whether the container of the start of the Range is of a type that does not allow
                // children of the type of node: the browser's DOM implementation should do this for us when we attempt
                // to add the node

                var firstNodeInserted = insertNodeAtPosition(node, this.startContainer, this.startOffset);
                this.setStartBefore(firstNodeInserted);
            },

            cloneContents: function() {
                assertRangeValid(this);

                var clone, frag;
                if (this.collapsed) {
                    return getRangeDocument(this).createDocumentFragment();
                } else {
                    if (this.startContainer === this.endContainer && isCharacterDataNode(this.startContainer)) {
                        clone = this.startContainer.cloneNode(true);
                        clone.data = clone.data.slice(this.startOffset, this.endOffset);
                        frag = getRangeDocument(this).createDocumentFragment();
                        frag.appendChild(clone);
                        return frag;
                    } else {
                        var iterator = new RangeIterator(this, true);
                        clone = cloneSubtree(iterator);
                        iterator.detach();
                    }
                    return clone;
                }
            },

            canSurroundContents: function() {
                assertRangeValid(this);
                assertNodeNotReadOnly(this.startContainer);
                assertNodeNotReadOnly(this.endContainer);

                // Check if the contents can be surrounded. Specifically, this means whether the range partially selects
                // no non-text nodes.
                var iterator = new RangeIterator(this, true);
                var boundariesInvalid = (iterator._first && (isNonTextPartiallySelected(iterator._first, this)) ||
                (iterator._last && isNonTextPartiallySelected(iterator._last, this)));
                iterator.detach();
                return !boundariesInvalid;
            },

            surroundContents: function(node) {
                assertValidNodeType(node, surroundNodeTypes);

                if (!this.canSurroundContents()) {
                    throw new DOMException("INVALID_STATE_ERR");
                }

                // Extract the contents
                var content = this.extractContents();

                // Clear the children of the node
                if (node.hasChildNodes()) {
                    while (node.lastChild) {
                        node.removeChild(node.lastChild);
                    }
                }

                // Insert the new node and add the extracted contents
                insertNodeAtPosition(node, this.startContainer, this.startOffset);
                node.appendChild(content);

                this.selectNode(node);
            },

            cloneRange: function() {
                assertRangeValid(this);
                var range = new Range(getRangeDocument(this));
                var i = rangeProperties.length, prop;
                while (i--) {
                    prop = rangeProperties[i];
                    range[prop] = this[prop];
                }
                return range;
            },

            toString: function() {
                assertRangeValid(this);
                var sc = this.startContainer;
                if (sc === this.endContainer && isCharacterDataNode(sc)) {
                    return (sc.nodeType == 3 || sc.nodeType == 4) ? sc.data.slice(this.startOffset, this.endOffset) : "";
                } else {
                    var textParts = [], iterator = new RangeIterator(this, true);
                    iterateSubtree(iterator, function(node) {
                        // Accept only text or CDATA nodes, not comments
                        if (node.nodeType == 3 || node.nodeType == 4) {
                            textParts.push(node.data);
                        }
                    });
                    iterator.detach();
                    return textParts.join("");
                }
            },

            // The methods below are all non-standard. The following batch were introduced by Mozilla but have since
            // been removed from Mozilla.

            compareNode: function(node) {
                assertRangeValid(this);

                var parent = node.parentNode;
                var nodeIndex = getNodeIndex(node);

                if (!parent) {
                    throw new DOMException("NOT_FOUND_ERR");
                }

                var startComparison = this.comparePoint(parent, nodeIndex),
                    endComparison = this.comparePoint(parent, nodeIndex + 1);

                if (startComparison < 0) { // Node starts before
                    return (endComparison > 0) ? n_b_a : n_b;
                } else {
                    return (endComparison > 0) ? n_a : n_i;
                }
            },

            comparePoint: function(node, offset) {
                assertRangeValid(this);
                assertNode(node, "HIERARCHY_REQUEST_ERR");
                assertSameDocumentOrFragment(node, this.startContainer);

                if (comparePoints(node, offset, this.startContainer, this.startOffset) < 0) {
                    return -1;
                } else if (comparePoints(node, offset, this.endContainer, this.endOffset) > 0) {
                    return 1;
                }
                return 0;
            },

            createContextualFragment: createContextualFragment,

            toHtml: function() {
                return rangeToHtml(this);
            },

            // touchingIsIntersecting determines whether this method considers a node that borders a range intersects
            // with it (as in WebKit) or not (as in Gecko pre-1.9, and the default)
            intersectsNode: function(node, touchingIsIntersecting) {
                assertRangeValid(this);
                if (getRootContainer(node) != getRangeRoot(this)) {
                    return false;
                }

                var parent = node.parentNode, offset = getNodeIndex(node);
                if (!parent) {
                    return true;
                }

                var startComparison = comparePoints(parent, offset, this.endContainer, this.endOffset),
                    endComparison = comparePoints(parent, offset + 1, this.startContainer, this.startOffset);

                return touchingIsIntersecting ? startComparison <= 0 && endComparison >= 0 : startComparison < 0 && endComparison > 0;
            },

            isPointInRange: function(node, offset) {
                assertRangeValid(this);
                assertNode(node, "HIERARCHY_REQUEST_ERR");
                assertSameDocumentOrFragment(node, this.startContainer);

                return (comparePoints(node, offset, this.startContainer, this.startOffset) >= 0) &&
                    (comparePoints(node, offset, this.endContainer, this.endOffset) <= 0);
            },

            // The methods below are non-standard and invented by me.

            // Sharing a boundary start-to-end or end-to-start does not count as intersection.
            intersectsRange: function(range) {
                return rangesIntersect(this, range, false);
            },

            // Sharing a boundary start-to-end or end-to-start does count as intersection.
            intersectsOrTouchesRange: function(range) {
                return rangesIntersect(this, range, true);
            },

            intersection: function(range) {
                if (this.intersectsRange(range)) {
                    var startComparison = comparePoints(this.startContainer, this.startOffset, range.startContainer, range.startOffset),
                        endComparison = comparePoints(this.endContainer, this.endOffset, range.endContainer, range.endOffset);

                    var intersectionRange = this.cloneRange();
                    if (startComparison == -1) {
                        intersectionRange.setStart(range.startContainer, range.startOffset);
                    }
                    if (endComparison == 1) {
                        intersectionRange.setEnd(range.endContainer, range.endOffset);
                    }
                    return intersectionRange;
                }
                return null;
            },

            union: function(range) {
                if (this.intersectsOrTouchesRange(range)) {
                    var unionRange = this.cloneRange();
                    if (comparePoints(range.startContainer, range.startOffset, this.startContainer, this.startOffset) == -1) {
                        unionRange.setStart(range.startContainer, range.startOffset);
                    }
                    if (comparePoints(range.endContainer, range.endOffset, this.endContainer, this.endOffset) == 1) {
                        unionRange.setEnd(range.endContainer, range.endOffset);
                    }
                    return unionRange;
                } else {
                    throw new DOMException("Ranges do not intersect");
                }
            },

            containsNode: function(node, allowPartial) {
                if (allowPartial) {
                    return this.intersectsNode(node, false);
                } else {
                    return this.compareNode(node) == n_i;
                }
            },

            containsNodeContents: function(node) {
                return this.comparePoint(node, 0) >= 0 && this.comparePoint(node, getNodeLength(node)) <= 0;
            },

            containsRange: function(range) {
                var intersection = this.intersection(range);
                return intersection !== null && range.equals(intersection);
            },

            containsNodeText: function(node) {
                var nodeRange = this.cloneRange();
                nodeRange.selectNode(node);
                var textNodes = nodeRange.getNodes([3]);
                if (textNodes.length > 0) {
                    nodeRange.setStart(textNodes[0], 0);
                    var lastTextNode = textNodes.pop();
                    nodeRange.setEnd(lastTextNode, lastTextNode.length);
                    return this.containsRange(nodeRange);
                } else {
                    return this.containsNodeContents(node);
                }
            },

            getNodes: function(nodeTypes, filter) {
                assertRangeValid(this);
                return getNodesInRange(this, nodeTypes, filter);
            },

            getDocument: function() {
                return getRangeDocument(this);
            },

            collapseBefore: function(node) {
                this.setEndBefore(node);
                this.collapse(false);
            },

            collapseAfter: function(node) {
                this.setStartAfter(node);
                this.collapse(true);
            },

            getBookmark: function(containerNode) {
                var doc = getRangeDocument(this);
                var preSelectionRange = api.createRange(doc);
                containerNode = containerNode || dom.getBody(doc);
                preSelectionRange.selectNodeContents(containerNode);
                var range = this.intersection(preSelectionRange);
                var start = 0, end = 0;
                if (range) {
                    preSelectionRange.setEnd(range.startContainer, range.startOffset);
                    start = preSelectionRange.toString().length;
                    end = start + range.toString().length;
                }

                return {
                    start: start,
                    end: end,
                    containerNode: containerNode
                };
            },

            moveToBookmark: function(bookmark) {
                var containerNode = bookmark.containerNode;
                var charIndex = 0;
                this.setStart(containerNode, 0);
                this.collapse(true);
                var nodeStack = [containerNode], node, foundStart = false, stop = false;
                var nextCharIndex, i, childNodes;

                while (!stop && (node = nodeStack.pop())) {
                    if (node.nodeType == 3) {
                        nextCharIndex = charIndex + node.length;
                        if (!foundStart && bookmark.start >= charIndex && bookmark.start <= nextCharIndex) {
                            this.setStart(node, bookmark.start - charIndex);
                            foundStart = true;
                        }
                        if (foundStart && bookmark.end >= charIndex && bookmark.end <= nextCharIndex) {
                            this.setEnd(node, bookmark.end - charIndex);
                            stop = true;
                        }
                        charIndex = nextCharIndex;
                    } else {
                        childNodes = node.childNodes;
                        i = childNodes.length;
                        while (i--) {
                            nodeStack.push(childNodes[i]);
                        }
                    }
                }
            },

            getName: function() {
                return "DomRange";
            },

            equals: function(range) {
                return Range.rangesEqual(this, range);
            },

            isValid: function() {
                return isRangeValid(this);
            },

            inspect: function() {
                return inspect(this);
            },

            detach: function() {
                // In DOM4, detach() is now a no-op.
            }
        });

        function copyComparisonConstantsToObject(obj) {
            obj.START_TO_START = s2s;
            obj.START_TO_END = s2e;
            obj.END_TO_END = e2e;
            obj.END_TO_START = e2s;

            obj.NODE_BEFORE = n_b;
            obj.NODE_AFTER = n_a;
            obj.NODE_BEFORE_AND_AFTER = n_b_a;
            obj.NODE_INSIDE = n_i;
        }

        function copyComparisonConstants(constructor) {
            copyComparisonConstantsToObject(constructor);
            copyComparisonConstantsToObject(constructor.prototype);
        }

        function createRangeContentRemover(remover, boundaryUpdater) {
            return function() {
                assertRangeValid(this);

                var sc = this.startContainer, so = this.startOffset, root = this.commonAncestorContainer;

                var iterator = new RangeIterator(this, true);

                // Work out where to position the range after content removal
                var node, boundary;
                if (sc !== root) {
                    node = getClosestAncestorIn(sc, root, true);
                    boundary = getBoundaryAfterNode(node);
                    sc = boundary.node;
                    so = boundary.offset;
                }

                // Check none of the range is read-only
                iterateSubtree(iterator, assertNodeNotReadOnly);

                iterator.reset();

                // Remove the content
                var returnValue = remover(iterator);
                iterator.detach();

                // Move to the new position
                boundaryUpdater(this, sc, so, sc, so);

                return returnValue;
            };
        }

        function createPrototypeRange(constructor, boundaryUpdater) {
            function createBeforeAfterNodeSetter(isBefore, isStart) {
                return function(node) {
                    assertValidNodeType(node, beforeAfterNodeTypes);
                    assertValidNodeType(getRootContainer(node), rootContainerNodeTypes);

                    var boundary = (isBefore ? getBoundaryBeforeNode : getBoundaryAfterNode)(node);
                    (isStart ? setRangeStart : setRangeEnd)(this, boundary.node, boundary.offset);
                };
            }

            function setRangeStart(range, node, offset) {
                var ec = range.endContainer, eo = range.endOffset;
                if (node !== range.startContainer || offset !== range.startOffset) {
                    // Check the root containers of the range and the new boundary, and also check whether the new boundary
                    // is after the current end. In either case, collapse the range to the new position
                    if (getRootContainer(node) != getRootContainer(ec) || comparePoints(node, offset, ec, eo) == 1) {
                        ec = node;
                        eo = offset;
                    }
                    boundaryUpdater(range, node, offset, ec, eo);
                }
            }

            function setRangeEnd(range, node, offset) {
                var sc = range.startContainer, so = range.startOffset;
                if (node !== range.endContainer || offset !== range.endOffset) {
                    // Check the root containers of the range and the new boundary, and also check whether the new boundary
                    // is after the current end. In either case, collapse the range to the new position
                    if (getRootContainer(node) != getRootContainer(sc) || comparePoints(node, offset, sc, so) == -1) {
                        sc = node;
                        so = offset;
                    }
                    boundaryUpdater(range, sc, so, node, offset);
                }
            }

            // Set up inheritance
            var F = function() {};
            F.prototype = api.rangePrototype;
            constructor.prototype = new F();

            util.extend(constructor.prototype, {
                setStart: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);

                    setRangeStart(this, node, offset);
                },

                setEnd: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);

                    setRangeEnd(this, node, offset);
                },

                /**
                 * Convenience method to set a range's start and end boundaries. Overloaded as follows:
                 * - Two parameters (node, offset) creates a collapsed range at that position
                 * - Three parameters (node, startOffset, endOffset) creates a range contained with node starting at
                 *   startOffset and ending at endOffset
                 * - Four parameters (startNode, startOffset, endNode, endOffset) creates a range starting at startOffset in
                 *   startNode and ending at endOffset in endNode
                 */
                setStartAndEnd: function() {
                    var args = arguments;
                    var sc = args[0], so = args[1], ec = sc, eo = so;

                    switch (args.length) {
                        case 3:
                            eo = args[2];
                            break;
                        case 4:
                            ec = args[2];
                            eo = args[3];
                            break;
                    }

                    boundaryUpdater(this, sc, so, ec, eo);
                },

                setBoundary: function(node, offset, isStart) {
                    this["set" + (isStart ? "Start" : "End")](node, offset);
                },

                setStartBefore: createBeforeAfterNodeSetter(true, true),
                setStartAfter: createBeforeAfterNodeSetter(false, true),
                setEndBefore: createBeforeAfterNodeSetter(true, false),
                setEndAfter: createBeforeAfterNodeSetter(false, false),

                collapse: function(isStart) {
                    assertRangeValid(this);
                    if (isStart) {
                        boundaryUpdater(this, this.startContainer, this.startOffset, this.startContainer, this.startOffset);
                    } else {
                        boundaryUpdater(this, this.endContainer, this.endOffset, this.endContainer, this.endOffset);
                    }
                },

                selectNodeContents: function(node) {
                    assertNoDocTypeNotationEntityAncestor(node, true);

                    boundaryUpdater(this, node, 0, node, getNodeLength(node));
                },

                selectNode: function(node) {
                    assertNoDocTypeNotationEntityAncestor(node, false);
                    assertValidNodeType(node, beforeAfterNodeTypes);

                    var start = getBoundaryBeforeNode(node), end = getBoundaryAfterNode(node);
                    boundaryUpdater(this, start.node, start.offset, end.node, end.offset);
                },

                extractContents: createRangeContentRemover(extractSubtree, boundaryUpdater),

                deleteContents: createRangeContentRemover(deleteSubtree, boundaryUpdater),

                canSurroundContents: function() {
                    assertRangeValid(this);
                    assertNodeNotReadOnly(this.startContainer);
                    assertNodeNotReadOnly(this.endContainer);

                    // Check if the contents can be surrounded. Specifically, this means whether the range partially selects
                    // no non-text nodes.
                    var iterator = new RangeIterator(this, true);
                    var boundariesInvalid = (iterator._first && isNonTextPartiallySelected(iterator._first, this) ||
                    (iterator._last && isNonTextPartiallySelected(iterator._last, this)));
                    iterator.detach();
                    return !boundariesInvalid;
                },

                splitBoundaries: function() {
                    splitRangeBoundaries(this);
                },

                splitBoundariesPreservingPositions: function(positionsToPreserve) {
                    splitRangeBoundaries(this, positionsToPreserve);
                },

                normalizeBoundaries: function() {
                    assertRangeValid(this);

                    var sc = this.startContainer, so = this.startOffset, ec = this.endContainer, eo = this.endOffset;

                    var mergeForward = function(node) {
                        var sibling = node.nextSibling;
                        if (sibling && sibling.nodeType == node.nodeType) {
                            ec = node;
                            eo = node.length;
                            node.appendData(sibling.data);
                            removeNode(sibling);
                        }
                    };

                    var mergeBackward = function(node) {
                        var sibling = node.previousSibling;
                        if (sibling && sibling.nodeType == node.nodeType) {
                            sc = node;
                            var nodeLength = node.length;
                            so = sibling.length;
                            node.insertData(0, sibling.data);
                            removeNode(sibling);
                            if (sc == ec) {
                                eo += so;
                                ec = sc;
                            } else if (ec == node.parentNode) {
                                var nodeIndex = getNodeIndex(node);
                                if (eo == nodeIndex) {
                                    ec = node;
                                    eo = nodeLength;
                                } else if (eo > nodeIndex) {
                                    eo--;
                                }
                            }
                        }
                    };

                    var normalizeStart = true;
                    var sibling;

                    if (isCharacterDataNode(ec)) {
                        if (eo == ec.length) {
                            mergeForward(ec);
                        } else if (eo == 0) {
                            sibling = ec.previousSibling;
                            if (sibling && sibling.nodeType == ec.nodeType) {
                                eo = sibling.length;
                                if (sc == ec) {
                                    normalizeStart = false;
                                }
                                sibling.appendData(ec.data);
                                removeNode(ec);
                                ec = sibling;
                            }
                        }
                    } else {
                        if (eo > 0) {
                            var endNode = ec.childNodes[eo - 1];
                            if (endNode && isCharacterDataNode(endNode)) {
                                mergeForward(endNode);
                            }
                        }
                        normalizeStart = !this.collapsed;
                    }

                    if (normalizeStart) {
                        if (isCharacterDataNode(sc)) {
                            if (so == 0) {
                                mergeBackward(sc);
                            } else if (so == sc.length) {
                                sibling = sc.nextSibling;
                                if (sibling && sibling.nodeType == sc.nodeType) {
                                    if (ec == sibling) {
                                        ec = sc;
                                        eo += sc.length;
                                    }
                                    sc.appendData(sibling.data);
                                    removeNode(sibling);
                                }
                            }
                        } else {
                            if (so < sc.childNodes.length) {
                                var startNode = sc.childNodes[so];
                                if (startNode && isCharacterDataNode(startNode)) {
                                    mergeBackward(startNode);
                                }
                            }
                        }
                    } else {
                        sc = ec;
                        so = eo;
                    }

                    boundaryUpdater(this, sc, so, ec, eo);
                },

                collapseToPoint: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);
                    this.setStartAndEnd(node, offset);
                }
            });

            copyComparisonConstants(constructor);
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Updates commonAncestorContainer and collapsed after boundary change
        function updateCollapsedAndCommonAncestor(range) {
            range.collapsed = (range.startContainer === range.endContainer && range.startOffset === range.endOffset);
            range.commonAncestorContainer = range.collapsed ?
                range.startContainer : dom.getCommonAncestor(range.startContainer, range.endContainer);
        }

        function updateBoundaries(range, startContainer, startOffset, endContainer, endOffset) {
            range.startContainer = startContainer;
            range.startOffset = startOffset;
            range.endContainer = endContainer;
            range.endOffset = endOffset;
            range.document = dom.getDocument(startContainer);

            updateCollapsedAndCommonAncestor(range);
        }

        function Range(doc) {
            this.startContainer = doc;
            this.startOffset = 0;
            this.endContainer = doc;
            this.endOffset = 0;
            this.document = doc;
            updateCollapsedAndCommonAncestor(this);
        }

        createPrototypeRange(Range, updateBoundaries);

        util.extend(Range, {
            rangeProperties: rangeProperties,
            RangeIterator: RangeIterator,
            copyComparisonConstants: copyComparisonConstants,
            createPrototypeRange: createPrototypeRange,
            inspect: inspect,
            toHtml: rangeToHtml,
            getRangeDocument: getRangeDocument,
            rangesEqual: function(r1, r2) {
                return r1.startContainer === r2.startContainer &&
                    r1.startOffset === r2.startOffset &&
                    r1.endContainer === r2.endContainer &&
                    r1.endOffset === r2.endOffset;
            }
        });

        api.DomRange = Range;
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // Wrappers for the browser's native DOM Range and/or TextRange implementation
    api.createCoreModule("WrappedRange", ["DomRange"], function(api, module) {
        var WrappedRange, WrappedTextRange;
        var dom = api.dom;
        var util = api.util;
        var DomPosition = dom.DomPosition;
        var DomRange = api.DomRange;
        var getBody = dom.getBody;
        var getContentDocument = dom.getContentDocument;
        var isCharacterDataNode = dom.isCharacterDataNode;


        /*----------------------------------------------------------------------------------------------------------------*/

        if (api.features.implementsDomRange) {
            // This is a wrapper around the browser's native DOM Range. It has two aims:
            // - Provide workarounds for specific browser bugs
            // - provide convenient extensions, which are inherited from Rangy's DomRange

            (function() {
                var rangeProto;
                var rangeProperties = DomRange.rangeProperties;

                function updateRangeProperties(range) {
                    var i = rangeProperties.length, prop;
                    while (i--) {
                        prop = rangeProperties[i];
                        range[prop] = range.nativeRange[prop];
                    }
                    // Fix for broken collapsed property in IE 9.
                    range.collapsed = (range.startContainer === range.endContainer && range.startOffset === range.endOffset);
                }

                function updateNativeRange(range, startContainer, startOffset, endContainer, endOffset) {
                    var startMoved = (range.startContainer !== startContainer || range.startOffset != startOffset);
                    var endMoved = (range.endContainer !== endContainer || range.endOffset != endOffset);
                    var nativeRangeDifferent = !range.equals(range.nativeRange);

                    // Always set both boundaries for the benefit of IE9 (see issue 35)
                    if (startMoved || endMoved || nativeRangeDifferent) {
                        range.setEnd(endContainer, endOffset);
                        range.setStart(startContainer, startOffset);
                    }
                }

                var createBeforeAfterNodeSetter;

                WrappedRange = function(range) {
                    if (!range) {
                        throw module.createError("WrappedRange: Range must be specified");
                    }
                    this.nativeRange = range;
                    updateRangeProperties(this);
                };

                DomRange.createPrototypeRange(WrappedRange, updateNativeRange);

                rangeProto = WrappedRange.prototype;

                rangeProto.selectNode = function(node) {
                    this.nativeRange.selectNode(node);
                    updateRangeProperties(this);
                };

                rangeProto.cloneContents = function() {
                    return this.nativeRange.cloneContents();
                };

                // Due to a long-standing Firefox bug that I have not been able to find a reliable way to detect,
                // insertNode() is never delegated to the native range.

                rangeProto.surroundContents = function(node) {
                    this.nativeRange.surroundContents(node);
                    updateRangeProperties(this);
                };

                rangeProto.collapse = function(isStart) {
                    this.nativeRange.collapse(isStart);
                    updateRangeProperties(this);
                };

                rangeProto.cloneRange = function() {
                    return new WrappedRange(this.nativeRange.cloneRange());
                };

                rangeProto.refresh = function() {
                    updateRangeProperties(this);
                };

                rangeProto.toString = function() {
                    return this.nativeRange.toString();
                };

                // Create test range and node for feature detection

                var testTextNode = document.createTextNode("test");
                getBody(document).appendChild(testTextNode);
                var range = document.createRange();

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for Firefox 2 bug that prevents moving the start of a Range to a point after its current end and
                // correct for it

                range.setStart(testTextNode, 0);
                range.setEnd(testTextNode, 0);

                try {
                    range.setStart(testTextNode, 1);

                    rangeProto.setStart = function(node, offset) {
                        this.nativeRange.setStart(node, offset);
                        updateRangeProperties(this);
                    };

                    rangeProto.setEnd = function(node, offset) {
                        this.nativeRange.setEnd(node, offset);
                        updateRangeProperties(this);
                    };

                    createBeforeAfterNodeSetter = function(name) {
                        return function(node) {
                            this.nativeRange[name](node);
                            updateRangeProperties(this);
                        };
                    };

                } catch(ex) {

                    rangeProto.setStart = function(node, offset) {
                        try {
                            this.nativeRange.setStart(node, offset);
                        } catch (ex) {
                            this.nativeRange.setEnd(node, offset);
                            this.nativeRange.setStart(node, offset);
                        }
                        updateRangeProperties(this);
                    };

                    rangeProto.setEnd = function(node, offset) {
                        try {
                            this.nativeRange.setEnd(node, offset);
                        } catch (ex) {
                            this.nativeRange.setStart(node, offset);
                            this.nativeRange.setEnd(node, offset);
                        }
                        updateRangeProperties(this);
                    };

                    createBeforeAfterNodeSetter = function(name, oppositeName) {
                        return function(node) {
                            try {
                                this.nativeRange[name](node);
                            } catch (ex) {
                                this.nativeRange[oppositeName](node);
                                this.nativeRange[name](node);
                            }
                            updateRangeProperties(this);
                        };
                    };
                }

                rangeProto.setStartBefore = createBeforeAfterNodeSetter("setStartBefore", "setEndBefore");
                rangeProto.setStartAfter = createBeforeAfterNodeSetter("setStartAfter", "setEndAfter");
                rangeProto.setEndBefore = createBeforeAfterNodeSetter("setEndBefore", "setStartBefore");
                rangeProto.setEndAfter = createBeforeAfterNodeSetter("setEndAfter", "setStartAfter");

                /*--------------------------------------------------------------------------------------------------------*/

                // Always use DOM4-compliant selectNodeContents implementation: it's simpler and less code than testing
                // whether the native implementation can be trusted
                rangeProto.selectNodeContents = function(node) {
                    this.setStartAndEnd(node, 0, dom.getNodeLength(node));
                };

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for and correct WebKit bug that has the behaviour of compareBoundaryPoints round the wrong way for
                // constants START_TO_END and END_TO_START: https://bugs.webkit.org/show_bug.cgi?id=20738

                range.selectNodeContents(testTextNode);
                range.setEnd(testTextNode, 3);

                var range2 = document.createRange();
                range2.selectNodeContents(testTextNode);
                range2.setEnd(testTextNode, 4);
                range2.setStart(testTextNode, 2);

                if (range.compareBoundaryPoints(range.START_TO_END, range2) == -1 &&
                    range.compareBoundaryPoints(range.END_TO_START, range2) == 1) {
                    // This is the wrong way round, so correct for it

                    rangeProto.compareBoundaryPoints = function(type, range) {
                        range = range.nativeRange || range;
                        if (type == range.START_TO_END) {
                            type = range.END_TO_START;
                        } else if (type == range.END_TO_START) {
                            type = range.START_TO_END;
                        }
                        return this.nativeRange.compareBoundaryPoints(type, range);
                    };
                } else {
                    rangeProto.compareBoundaryPoints = function(type, range) {
                        return this.nativeRange.compareBoundaryPoints(type, range.nativeRange || range);
                    };
                }

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for IE deleteContents() and extractContents() bug and correct it. See issue 107.

                var el = document.createElement("div");
                el.innerHTML = "123";
                var textNode = el.firstChild;
                var body = getBody(document);
                body.appendChild(el);

                range.setStart(textNode, 1);
                range.setEnd(textNode, 2);
                range.deleteContents();

                if (textNode.data == "13") {
                    // Behaviour is correct per DOM4 Range so wrap the browser's implementation of deleteContents() and
                    // extractContents()
                    rangeProto.deleteContents = function() {
                        this.nativeRange.deleteContents();
                        updateRangeProperties(this);
                    };

                    rangeProto.extractContents = function() {
                        var frag = this.nativeRange.extractContents();
                        updateRangeProperties(this);
                        return frag;
                    };
                } else {
                }

                body.removeChild(el);
                body = null;

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for existence of createContextualFragment and delegate to it if it exists
                if (util.isHostMethod(range, "createContextualFragment")) {
                    rangeProto.createContextualFragment = function(fragmentStr) {
                        return this.nativeRange.createContextualFragment(fragmentStr);
                    };
                }

                /*--------------------------------------------------------------------------------------------------------*/

                // Clean up
                getBody(document).removeChild(testTextNode);

                rangeProto.getName = function() {
                    return "WrappedRange";
                };

                api.WrappedRange = WrappedRange;

                api.createNativeRange = function(doc) {
                    doc = getContentDocument(doc, module, "createNativeRange");
                    return doc.createRange();
                };
            })();
        }

        if (api.features.implementsTextRange) {
            /*
             This is a workaround for a bug where IE returns the wrong container element from the TextRange's parentElement()
             method. For example, in the following (where pipes denote the selection boundaries):

             <ul id="ul"><li id="a">| a </li><li id="b"> b |</li></ul>

             var range = document.selection.createRange();
             alert(range.parentElement().id); // Should alert "ul" but alerts "b"

             This method returns the common ancestor node of the following:
             - the parentElement() of the textRange
             - the parentElement() of the textRange after calling collapse(true)
             - the parentElement() of the textRange after calling collapse(false)
             */
            var getTextRangeContainerElement = function(textRange) {
                var parentEl = textRange.parentElement();
                var range = textRange.duplicate();
                range.collapse(true);
                var startEl = range.parentElement();
                range = textRange.duplicate();
                range.collapse(false);
                var endEl = range.parentElement();
                var startEndContainer = (startEl == endEl) ? startEl : dom.getCommonAncestor(startEl, endEl);

                return startEndContainer == parentEl ? startEndContainer : dom.getCommonAncestor(parentEl, startEndContainer);
            };

            var textRangeIsCollapsed = function(textRange) {
                return textRange.compareEndPoints("StartToEnd", textRange) == 0;
            };

            // Gets the boundary of a TextRange expressed as a node and an offset within that node. This function started
            // out as an improved version of code found in Tim Cameron Ryan's IERange (http://code.google.com/p/ierange/)
            // but has grown, fixing problems with line breaks in preformatted text, adding workaround for IE TextRange
            // bugs, handling for inputs and images, plus optimizations.
            var getTextRangeBoundaryPosition = function(textRange, wholeRangeContainerElement, isStart, isCollapsed, startInfo) {
                var workingRange = textRange.duplicate();
                workingRange.collapse(isStart);
                var containerElement = workingRange.parentElement();

                // Sometimes collapsing a TextRange that's at the start of a text node can move it into the previous node, so
                // check for that
                if (!dom.isOrIsAncestorOf(wholeRangeContainerElement, containerElement)) {
                    containerElement = wholeRangeContainerElement;
                }


                // Deal with nodes that cannot "contain rich HTML markup". In practice, this means form inputs, images and
                // similar. See http://msdn.microsoft.com/en-us/library/aa703950%28VS.85%29.aspx
                if (!containerElement.canHaveHTML) {
                    var pos = new DomPosition(containerElement.parentNode, dom.getNodeIndex(containerElement));
                    return {
                        boundaryPosition: pos,
                        nodeInfo: {
                            nodeIndex: pos.offset,
                            containerElement: pos.node
                        }
                    };
                }

                var workingNode = dom.getDocument(containerElement).createElement("span");

                // Workaround for HTML5 Shiv's insane violation of document.createElement(). See Rangy issue 104 and HTML5
                // Shiv issue 64: https://github.com/aFarkas/html5shiv/issues/64
                if (workingNode.parentNode) {
                    dom.removeNode(workingNode);
                }

                var comparison, workingComparisonType = isStart ? "StartToStart" : "StartToEnd";
                var previousNode, nextNode, boundaryPosition, boundaryNode;
                var start = (startInfo && startInfo.containerElement == containerElement) ? startInfo.nodeIndex : 0;
                var childNodeCount = containerElement.childNodes.length;
                var end = childNodeCount;

                // Check end first. Code within the loop assumes that the endth child node of the container is definitely
                // after the range boundary.
                var nodeIndex = end;

                while (true) {
                    if (nodeIndex == childNodeCount) {
                        containerElement.appendChild(workingNode);
                    } else {
                        containerElement.insertBefore(workingNode, containerElement.childNodes[nodeIndex]);
                    }
                    workingRange.moveToElementText(workingNode);
                    comparison = workingRange.compareEndPoints(workingComparisonType, textRange);
                    if (comparison == 0 || start == end) {
                        break;
                    } else if (comparison == -1) {
                        if (end == start + 1) {
                            // We know the endth child node is after the range boundary, so we must be done.
                            break;
                        } else {
                            start = nodeIndex;
                        }
                    } else {
                        end = (end == start + 1) ? start : nodeIndex;
                    }
                    nodeIndex = Math.floor((start + end) / 2);
                    containerElement.removeChild(workingNode);
                }


                // We've now reached or gone past the boundary of the text range we're interested in
                // so have identified the node we want
                boundaryNode = workingNode.nextSibling;

                if (comparison == -1 && boundaryNode && isCharacterDataNode(boundaryNode)) {
                    // This is a character data node (text, comment, cdata). The working range is collapsed at the start of
                    // the node containing the text range's boundary, so we move the end of the working range to the
                    // boundary point and measure the length of its text to get the boundary's offset within the node.
                    workingRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);

                    var offset;

                    if (/[\r\n]/.test(boundaryNode.data)) {
                        /*
                         For the particular case of a boundary within a text node containing rendered line breaks (within a
                         <pre> element, for example), we need a slightly complicated approach to get the boundary's offset in
                         IE. The facts:

                         - Each line break is represented as \r in the text node's data/nodeValue properties
                         - Each line break is represented as \r\n in the TextRange's 'text' property
                         - The 'text' property of the TextRange does not contain trailing line breaks

                         To get round the problem presented by the final fact above, we can use the fact that TextRange's
                         moveStart() and moveEnd() methods return the actual number of characters moved, which is not
                         necessarily the same as the number of characters it was instructed to move. The simplest approach is
                         to use this to store the characters moved when moving both the start and end of the range to the
                         start of the document body and subtracting the start offset from the end offset (the
                         "move-negative-gazillion" method). However, this is extremely slow when the document is large and
                         the range is near the end of it. Clearly doing the mirror image (i.e. moving the range boundaries to
                         the end of the document) has the same problem.

                         Another approach that works is to use moveStart() to move the start boundary of the range up to the
                         end boundary one character at a time and incrementing a counter with the value returned by the
                         moveStart() call. However, the check for whether the start boundary has reached the end boundary is
                         expensive, so this method is slow (although unlike "move-negative-gazillion" is largely unaffected
                         by the location of the range within the document).

                         The approach used below is a hybrid of the two methods above. It uses the fact that a string
                         containing the TextRange's 'text' property with each \r\n converted to a single \r character cannot
                         be longer than the text of the TextRange, so the start of the range is moved that length initially
                         and then a character at a time to make up for any trailing line breaks not contained in the 'text'
                         property. This has good performance in most situations compared to the previous two methods.
                         */
                        var tempRange = workingRange.duplicate();
                        var rangeLength = tempRange.text.replace(/\r\n/g, "\r").length;

                        offset = tempRange.moveStart("character", rangeLength);
                        while ( (comparison = tempRange.compareEndPoints("StartToEnd", tempRange)) == -1) {
                            offset++;
                            tempRange.moveStart("character", 1);
                        }
                    } else {
                        offset = workingRange.text.length;
                    }
                    boundaryPosition = new DomPosition(boundaryNode, offset);
                } else {

                    // If the boundary immediately follows a character data node and this is the end boundary, we should favour
                    // a position within that, and likewise for a start boundary preceding a character data node
                    previousNode = (isCollapsed || !isStart) && workingNode.previousSibling;
                    nextNode = (isCollapsed || isStart) && workingNode.nextSibling;
                    if (nextNode && isCharacterDataNode(nextNode)) {
                        boundaryPosition = new DomPosition(nextNode, 0);
                    } else if (previousNode && isCharacterDataNode(previousNode)) {
                        boundaryPosition = new DomPosition(previousNode, previousNode.data.length);
                    } else {
                        boundaryPosition = new DomPosition(containerElement, dom.getNodeIndex(workingNode));
                    }
                }

                // Clean up
                dom.removeNode(workingNode);

                return {
                    boundaryPosition: boundaryPosition,
                    nodeInfo: {
                        nodeIndex: nodeIndex,
                        containerElement: containerElement
                    }
                };
            };

            // Returns a TextRange representing the boundary of a TextRange expressed as a node and an offset within that
            // node. This function started out as an optimized version of code found in Tim Cameron Ryan's IERange
            // (http://code.google.com/p/ierange/)
            var createBoundaryTextRange = function(boundaryPosition, isStart) {
                var boundaryNode, boundaryParent, boundaryOffset = boundaryPosition.offset;
                var doc = dom.getDocument(boundaryPosition.node);
                var workingNode, childNodes, workingRange = getBody(doc).createTextRange();
                var nodeIsDataNode = isCharacterDataNode(boundaryPosition.node);

                if (nodeIsDataNode) {
                    boundaryNode = boundaryPosition.node;
                    boundaryParent = boundaryNode.parentNode;
                } else {
                    childNodes = boundaryPosition.node.childNodes;
                    boundaryNode = (boundaryOffset < childNodes.length) ? childNodes[boundaryOffset] : null;
                    boundaryParent = boundaryPosition.node;
                }

                // Position the range immediately before the node containing the boundary
                workingNode = doc.createElement("span");

                // Making the working element non-empty element persuades IE to consider the TextRange boundary to be within
                // the element rather than immediately before or after it
                workingNode.innerHTML = "&#feff;";

                // insertBefore is supposed to work like appendChild if the second parameter is null. However, a bug report
                // for IERange suggests that it can crash the browser: http://code.google.com/p/ierange/issues/detail?id=12
                if (boundaryNode) {
                    boundaryParent.insertBefore(workingNode, boundaryNode);
                } else {
                    boundaryParent.appendChild(workingNode);
                }

                workingRange.moveToElementText(workingNode);
                workingRange.collapse(!isStart);

                // Clean up
                boundaryParent.removeChild(workingNode);

                // Move the working range to the text offset, if required
                if (nodeIsDataNode) {
                    workingRange[isStart ? "moveStart" : "moveEnd"]("character", boundaryOffset);
                }

                return workingRange;
            };

            /*------------------------------------------------------------------------------------------------------------*/

            // This is a wrapper around a TextRange, providing full DOM Range functionality using rangy's DomRange as a
            // prototype

            WrappedTextRange = function(textRange) {
                this.textRange = textRange;
                this.refresh();
            };

            WrappedTextRange.prototype = new DomRange(document);

            WrappedTextRange.prototype.refresh = function() {
                var start, end, startBoundary;

                // TextRange's parentElement() method cannot be trusted. getTextRangeContainerElement() works around that.
                var rangeContainerElement = getTextRangeContainerElement(this.textRange);

                if (textRangeIsCollapsed(this.textRange)) {
                    end = start = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, true,
                        true).boundaryPosition;
                } else {
                    startBoundary = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, true, false);
                    start = startBoundary.boundaryPosition;

                    // An optimization used here is that if the start and end boundaries have the same parent element, the
                    // search scope for the end boundary can be limited to exclude the portion of the element that precedes
                    // the start boundary
                    end = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, false, false,
                        startBoundary.nodeInfo).boundaryPosition;
                }

                this.setStart(start.node, start.offset);
                this.setEnd(end.node, end.offset);
            };

            WrappedTextRange.prototype.getName = function() {
                return "WrappedTextRange";
            };

            DomRange.copyComparisonConstants(WrappedTextRange);

            var rangeToTextRange = function(range) {
                if (range.collapsed) {
                    return createBoundaryTextRange(new DomPosition(range.startContainer, range.startOffset), true);
                } else {
                    var startRange = createBoundaryTextRange(new DomPosition(range.startContainer, range.startOffset), true);
                    var endRange = createBoundaryTextRange(new DomPosition(range.endContainer, range.endOffset), false);
                    var textRange = getBody( DomRange.getRangeDocument(range) ).createTextRange();
                    textRange.setEndPoint("StartToStart", startRange);
                    textRange.setEndPoint("EndToEnd", endRange);
                    return textRange;
                }
            };

            WrappedTextRange.rangeToTextRange = rangeToTextRange;

            WrappedTextRange.prototype.toTextRange = function() {
                return rangeToTextRange(this);
            };

            api.WrappedTextRange = WrappedTextRange;

            // IE 9 and above have both implementations and Rangy makes both available. The next few lines sets which
            // implementation to use by default.
            if (!api.features.implementsDomRange || api.config.preferTextRange) {
                // Add WrappedTextRange as the Range property of the global object to allow expression like Range.END_TO_END to work
                var globalObj = (function(f) { return f("return this;")(); })(Function);
                if (typeof globalObj.Range == "undefined") {
                    globalObj.Range = WrappedTextRange;
                }

                api.createNativeRange = function(doc) {
                    doc = getContentDocument(doc, module, "createNativeRange");
                    return getBody(doc).createTextRange();
                };

                api.WrappedRange = WrappedTextRange;
            }
        }

        api.createRange = function(doc) {
            doc = getContentDocument(doc, module, "createRange");
            return new api.WrappedRange(api.createNativeRange(doc));
        };

        api.createRangyRange = function(doc) {
            doc = getContentDocument(doc, module, "createRangyRange");
            return new DomRange(doc);
        };

        util.createAliasForDeprecatedMethod(api, "createIframeRange", "createRange");
        util.createAliasForDeprecatedMethod(api, "createIframeRangyRange", "createRangyRange");

        api.addShimListener(function(win) {
            var doc = win.document;
            if (typeof doc.createRange == "undefined") {
                doc.createRange = function() {
                    return api.createRange(doc);
                };
            }
            doc = win = null;
        });
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // This module creates a selection object wrapper that conforms as closely as possible to the Selection specification
    // in the HTML Editing spec (http://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#selections)
    api.createCoreModule("WrappedSelection", ["DomRange", "WrappedRange"], function(api, module) {
        api.config.checkSelectionRanges = true;

        var BOOLEAN = "boolean";
        var NUMBER = "number";
        var dom = api.dom;
        var util = api.util;
        var isHostMethod = util.isHostMethod;
        var DomRange = api.DomRange;
        var WrappedRange = api.WrappedRange;
        var DOMException = api.DOMException;
        var DomPosition = dom.DomPosition;
        var getNativeSelection;
        var selectionIsCollapsed;
        var features = api.features;
        var CONTROL = "Control";
        var getDocument = dom.getDocument;
        var getBody = dom.getBody;
        var rangesEqual = DomRange.rangesEqual;


        // Utility function to support direction parameters in the API that may be a string ("backward", "backwards",
        // "forward" or "forwards") or a Boolean (true for backwards).
        function isDirectionBackward(dir) {
            return (typeof dir == "string") ? /^backward(s)?$/i.test(dir) : !!dir;
        }

        function getWindow(win, methodName) {
            if (!win) {
                return window;
            } else if (dom.isWindow(win)) {
                return win;
            } else if (win instanceof WrappedSelection) {
                return win.win;
            } else {
                var doc = dom.getContentDocument(win, module, methodName);
                return dom.getWindow(doc);
            }
        }

        function getWinSelection(winParam) {
            return getWindow(winParam, "getWinSelection").getSelection();
        }

        function getDocSelection(winParam) {
            return getWindow(winParam, "getDocSelection").document.selection;
        }

        function winSelectionIsBackward(sel) {
            var backward = false;
            if (sel.anchorNode) {
                backward = (dom.comparePoints(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset) == 1);
            }
            return backward;
        }

        // Test for the Range/TextRange and Selection features required
        // Test for ability to retrieve selection
        var implementsWinGetSelection = isHostMethod(window, "getSelection"),
            implementsDocSelection = util.isHostObject(document, "selection");

        features.implementsWinGetSelection = implementsWinGetSelection;
        features.implementsDocSelection = implementsDocSelection;

        var useDocumentSelection = implementsDocSelection && (!implementsWinGetSelection || api.config.preferTextRange);

        if (useDocumentSelection) {
            getNativeSelection = getDocSelection;
            api.isSelectionValid = function(winParam) {
                var doc = getWindow(winParam, "isSelectionValid").document, nativeSel = doc.selection;

                // Check whether the selection TextRange is actually contained within the correct document
                return (nativeSel.type != "None" || getDocument(nativeSel.createRange().parentElement()) == doc);
            };
        } else if (implementsWinGetSelection) {
            getNativeSelection = getWinSelection;
            api.isSelectionValid = function() {
                return true;
            };
        } else {
            module.fail("Neither document.selection or window.getSelection() detected.");
            return false;
        }

        api.getNativeSelection = getNativeSelection;

        var testSelection = getNativeSelection();

        // In Firefox, the selection is null in an iframe with display: none. See issue #138.
        if (!testSelection) {
            module.fail("Native selection was null (possibly issue 138?)");
            return false;
        }

        var testRange = api.createNativeRange(document);
        var body = getBody(document);

        // Obtaining a range from a selection
        var selectionHasAnchorAndFocus = util.areHostProperties(testSelection,
            ["anchorNode", "focusNode", "anchorOffset", "focusOffset"]);

        features.selectionHasAnchorAndFocus = selectionHasAnchorAndFocus;

        // Test for existence of native selection extend() method
        var selectionHasExtend = isHostMethod(testSelection, "extend");
        features.selectionHasExtend = selectionHasExtend;

        // Test if rangeCount exists
        var selectionHasRangeCount = (typeof testSelection.rangeCount == NUMBER);
        features.selectionHasRangeCount = selectionHasRangeCount;

        var selectionSupportsMultipleRanges = false;
        var collapsedNonEditableSelectionsSupported = true;

        var addRangeBackwardToNative = selectionHasExtend ?
            function(nativeSelection, range) {
                var doc = DomRange.getRangeDocument(range);
                var endRange = api.createRange(doc);
                endRange.collapseToPoint(range.endContainer, range.endOffset);
                nativeSelection.addRange(getNativeRange(endRange));
                nativeSelection.extend(range.startContainer, range.startOffset);
            } : null;

        if (util.areHostMethods(testSelection, ["addRange", "getRangeAt", "removeAllRanges"]) &&
            typeof testSelection.rangeCount == NUMBER && features.implementsDomRange) {

            (function() {
                // Previously an iframe was used but this caused problems in some circumstances in IE, so tests are
                // performed on the current document's selection. See issue 109.

                // Note also that if a selection previously existed, it is wiped and later restored by these tests. This
                // will result in the selection direction begin reversed if the original selection was backwards and the
                // browser does not support setting backwards selections (Internet Explorer, I'm looking at you).
                var sel = window.getSelection();
                if (sel) {
                    // Store the current selection
                    var originalSelectionRangeCount = sel.rangeCount;
                    var selectionHasMultipleRanges = (originalSelectionRangeCount > 1);
                    var originalSelectionRanges = [];
                    var originalSelectionBackward = winSelectionIsBackward(sel);
                    for (var i = 0; i < originalSelectionRangeCount; ++i) {
                        originalSelectionRanges[i] = sel.getRangeAt(i);
                    }

                    // Create some test elements
                    var testEl = dom.createTestElement(document, "", false);
                    var textNode = testEl.appendChild( document.createTextNode("\u00a0\u00a0\u00a0") );

                    // Test whether the native selection will allow a collapsed selection within a non-editable element
                    var r1 = document.createRange();

                    r1.setStart(textNode, 1);
                    r1.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(r1);
                    collapsedNonEditableSelectionsSupported = (sel.rangeCount == 1);
                    sel.removeAllRanges();

                    // Test whether the native selection is capable of supporting multiple ranges.
                    if (!selectionHasMultipleRanges) {
                        // Doing the original feature test here in Chrome 36 (and presumably later versions) prints a
                        // console error of "Discontiguous selection is not supported." that cannot be suppressed. There's
                        // nothing we can do about this while retaining the feature test so we have to resort to a browser
                        // sniff. I'm not happy about it. See
                        // https://code.google.com/p/chromium/issues/detail?id=399791
                        var chromeMatch = window.navigator.appVersion.match(/Chrome\/(.*?) /);
                        if (chromeMatch && parseInt(chromeMatch[1]) >= 36) {
                            selectionSupportsMultipleRanges = false;
                        } else {
                            var r2 = r1.cloneRange();
                            r1.setStart(textNode, 0);
                            r2.setEnd(textNode, 3);
                            r2.setStart(textNode, 2);
                            sel.addRange(r1);
                            sel.addRange(r2);
                            selectionSupportsMultipleRanges = (sel.rangeCount == 2);
                        }
                    }

                    // Clean up
                    dom.removeNode(testEl);
                    sel.removeAllRanges();

                    for (i = 0; i < originalSelectionRangeCount; ++i) {
                        if (i == 0 && originalSelectionBackward) {
                            if (addRangeBackwardToNative) {
                                addRangeBackwardToNative(sel, originalSelectionRanges[i]);
                            } else {
                                api.warn("Rangy initialization: original selection was backwards but selection has been restored forwards because the browser does not support Selection.extend");
                                sel.addRange(originalSelectionRanges[i]);
                            }
                        } else {
                            sel.addRange(originalSelectionRanges[i]);
                        }
                    }
                }
            })();
        }

        features.selectionSupportsMultipleRanges = selectionSupportsMultipleRanges;
        features.collapsedNonEditableSelectionsSupported = collapsedNonEditableSelectionsSupported;

        // ControlRanges
        var implementsControlRange = false, testControlRange;

        if (body && isHostMethod(body, "createControlRange")) {
            testControlRange = body.createControlRange();
            if (util.areHostProperties(testControlRange, ["item", "add"])) {
                implementsControlRange = true;
            }
        }
        features.implementsControlRange = implementsControlRange;

        // Selection collapsedness
        if (selectionHasAnchorAndFocus) {
            selectionIsCollapsed = function(sel) {
                return sel.anchorNode === sel.focusNode && sel.anchorOffset === sel.focusOffset;
            };
        } else {
            selectionIsCollapsed = function(sel) {
                return sel.rangeCount ? sel.getRangeAt(sel.rangeCount - 1).collapsed : false;
            };
        }

        function updateAnchorAndFocusFromRange(sel, range, backward) {
            var anchorPrefix = backward ? "end" : "start", focusPrefix = backward ? "start" : "end";
            sel.anchorNode = range[anchorPrefix + "Container"];
            sel.anchorOffset = range[anchorPrefix + "Offset"];
            sel.focusNode = range[focusPrefix + "Container"];
            sel.focusOffset = range[focusPrefix + "Offset"];
        }

        function updateAnchorAndFocusFromNativeSelection(sel) {
            var nativeSel = sel.nativeSelection;
            sel.anchorNode = nativeSel.anchorNode;
            sel.anchorOffset = nativeSel.anchorOffset;
            sel.focusNode = nativeSel.focusNode;
            sel.focusOffset = nativeSel.focusOffset;
        }

        function updateEmptySelection(sel) {
            sel.anchorNode = sel.focusNode = null;
            sel.anchorOffset = sel.focusOffset = 0;
            sel.rangeCount = 0;
            sel.isCollapsed = true;
            sel._ranges.length = 0;
        }

        function getNativeRange(range) {
            var nativeRange;
            if (range instanceof DomRange) {
                nativeRange = api.createNativeRange(range.getDocument());
                nativeRange.setEnd(range.endContainer, range.endOffset);
                nativeRange.setStart(range.startContainer, range.startOffset);
            } else if (range instanceof WrappedRange) {
                nativeRange = range.nativeRange;
            } else if (features.implementsDomRange && (range instanceof dom.getWindow(range.startContainer).Range)) {
                nativeRange = range;
            }
            return nativeRange;
        }

        function rangeContainsSingleElement(rangeNodes) {
            if (!rangeNodes.length || rangeNodes[0].nodeType != 1) {
                return false;
            }
            for (var i = 1, len = rangeNodes.length; i < len; ++i) {
                if (!dom.isAncestorOf(rangeNodes[0], rangeNodes[i])) {
                    return false;
                }
            }
            return true;
        }

        function getSingleElementFromRange(range) {
            var nodes = range.getNodes();
            if (!rangeContainsSingleElement(nodes)) {
                throw module.createError("getSingleElementFromRange: range " + range.inspect() + " did not consist of a single element");
            }
            return nodes[0];
        }

        // Simple, quick test which only needs to distinguish between a TextRange and a ControlRange
        function isTextRange(range) {
            return !!range && typeof range.text != "undefined";
        }

        function updateFromTextRange(sel, range) {
            // Create a Range from the selected TextRange
            var wrappedRange = new WrappedRange(range);
            sel._ranges = [wrappedRange];

            updateAnchorAndFocusFromRange(sel, wrappedRange, false);
            sel.rangeCount = 1;
            sel.isCollapsed = wrappedRange.collapsed;
        }

        function updateControlSelection(sel) {
            // Update the wrapped selection based on what's now in the native selection
            sel._ranges.length = 0;
            if (sel.docSelection.type == "None") {
                updateEmptySelection(sel);
            } else {
                var controlRange = sel.docSelection.createRange();
                if (isTextRange(controlRange)) {
                    // This case (where the selection type is "Control" and calling createRange() on the selection returns
                    // a TextRange) can happen in IE 9. It happens, for example, when all elements in the selected
                    // ControlRange have been removed from the ControlRange and removed from the document.
                    updateFromTextRange(sel, controlRange);
                } else {
                    sel.rangeCount = controlRange.length;
                    var range, doc = getDocument(controlRange.item(0));
                    for (var i = 0; i < sel.rangeCount; ++i) {
                        range = api.createRange(doc);
                        range.selectNode(controlRange.item(i));
                        sel._ranges.push(range);
                    }
                    sel.isCollapsed = sel.rangeCount == 1 && sel._ranges[0].collapsed;
                    updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], false);
                }
            }
        }

        function addRangeToControlSelection(sel, range) {
            var controlRange = sel.docSelection.createRange();
            var rangeElement = getSingleElementFromRange(range);

            // Create a new ControlRange containing all the elements in the selected ControlRange plus the element
            // contained by the supplied range
            var doc = getDocument(controlRange.item(0));
            var newControlRange = getBody(doc).createControlRange();
            for (var i = 0, len = controlRange.length; i < len; ++i) {
                newControlRange.add(controlRange.item(i));
            }
            try {
                newControlRange.add(rangeElement);
            } catch (ex) {
                throw module.createError("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)");
            }
            newControlRange.select();

            // Update the wrapped selection based on what's now in the native selection
            updateControlSelection(sel);
        }

        var getSelectionRangeAt;

        if (isHostMethod(testSelection, "getRangeAt")) {
            // try/catch is present because getRangeAt() must have thrown an error in some browser and some situation.
            // Unfortunately, I didn't write a comment about the specifics and am now scared to take it out. Let that be a
            // lesson to us all, especially me.
            getSelectionRangeAt = function(sel, index) {
                try {
                    return sel.getRangeAt(index);
                } catch (ex) {
                    return null;
                }
            };
        } else if (selectionHasAnchorAndFocus) {
            getSelectionRangeAt = function(sel) {
                var doc = getDocument(sel.anchorNode);
                var range = api.createRange(doc);
                range.setStartAndEnd(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);

                // Handle the case when the selection was selected backwards (from the end to the start in the
                // document)
                if (range.collapsed !== this.isCollapsed) {
                    range.setStartAndEnd(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset);
                }

                return range;
            };
        }

        function WrappedSelection(selection, docSelection, win) {
            this.nativeSelection = selection;
            this.docSelection = docSelection;
            this._ranges = [];
            this.win = win;
            this.refresh();
        }

        WrappedSelection.prototype = api.selectionPrototype;

        function deleteProperties(sel) {
            sel.win = sel.anchorNode = sel.focusNode = sel._ranges = null;
            sel.rangeCount = sel.anchorOffset = sel.focusOffset = 0;
            sel.detached = true;
        }

        var cachedRangySelections = [];

        function actOnCachedSelection(win, action) {
            var i = cachedRangySelections.length, cached, sel;
            while (i--) {
                cached = cachedRangySelections[i];
                sel = cached.selection;
                if (action == "deleteAll") {
                    deleteProperties(sel);
                } else if (cached.win == win) {
                    if (action == "delete") {
                        cachedRangySelections.splice(i, 1);
                        return true;
                    } else {
                        return sel;
                    }
                }
            }
            if (action == "deleteAll") {
                cachedRangySelections.length = 0;
            }
            return null;
        }

        var getSelection = function(win) {
            // Check if the parameter is a Rangy Selection object
            if (win && win instanceof WrappedSelection) {
                win.refresh();
                return win;
            }

            win = getWindow(win, "getNativeSelection");

            var sel = actOnCachedSelection(win);
            var nativeSel = getNativeSelection(win), docSel = implementsDocSelection ? getDocSelection(win) : null;
            if (sel) {
                sel.nativeSelection = nativeSel;
                sel.docSelection = docSel;
                sel.refresh();
            } else {
                sel = new WrappedSelection(nativeSel, docSel, win);
                cachedRangySelections.push( { win: win, selection: sel } );
            }
            return sel;
        };

        api.getSelection = getSelection;

        util.createAliasForDeprecatedMethod(api, "getIframeSelection", "getSelection");

        var selProto = WrappedSelection.prototype;

        function createControlSelection(sel, ranges) {
            // Ensure that the selection becomes of type "Control"
            var doc = getDocument(ranges[0].startContainer);
            var controlRange = getBody(doc).createControlRange();
            for (var i = 0, el, len = ranges.length; i < len; ++i) {
                el = getSingleElementFromRange(ranges[i]);
                try {
                    controlRange.add(el);
                } catch (ex) {
                    throw module.createError("setRanges(): Element within one of the specified Ranges could not be added to control selection (does it have layout?)");
                }
            }
            controlRange.select();

            // Update the wrapped selection based on what's now in the native selection
            updateControlSelection(sel);
        }

        // Selecting a range
        if (!useDocumentSelection && selectionHasAnchorAndFocus && util.areHostMethods(testSelection, ["removeAllRanges", "addRange"])) {
            selProto.removeAllRanges = function() {
                this.nativeSelection.removeAllRanges();
                updateEmptySelection(this);
            };

            var addRangeBackward = function(sel, range) {
                addRangeBackwardToNative(sel.nativeSelection, range);
                sel.refresh();
            };

            if (selectionHasRangeCount) {
                selProto.addRange = function(range, direction) {
                    if (implementsControlRange && implementsDocSelection && this.docSelection.type == CONTROL) {
                        addRangeToControlSelection(this, range);
                    } else {
                        if (isDirectionBackward(direction) && selectionHasExtend) {
                            addRangeBackward(this, range);
                        } else {
                            var previousRangeCount;
                            if (selectionSupportsMultipleRanges) {
                                previousRangeCount = this.rangeCount;
                            } else {
                                this.removeAllRanges();
                                previousRangeCount = 0;
                            }
                            // Clone the native range so that changing the selected range does not affect the selection.
                            // This is contrary to the spec but is the only way to achieve consistency between browsers. See
                            // issue 80.
                            var clonedNativeRange = getNativeRange(range).cloneRange();
                            try {
                                this.nativeSelection.addRange(clonedNativeRange);
                            } catch (ex) {
                            }

                            // Check whether adding the range was successful
                            this.rangeCount = this.nativeSelection.rangeCount;

                            if (this.rangeCount == previousRangeCount + 1) {
                                // The range was added successfully

                                // Check whether the range that we added to the selection is reflected in the last range extracted from
                                // the selection
                                if (api.config.checkSelectionRanges) {
                                    var nativeRange = getSelectionRangeAt(this.nativeSelection, this.rangeCount - 1);
                                    if (nativeRange && !rangesEqual(nativeRange, range)) {
                                        // Happens in WebKit with, for example, a selection placed at the start of a text node
                                        range = new WrappedRange(nativeRange);
                                    }
                                }
                                this._ranges[this.rangeCount - 1] = range;
                                updateAnchorAndFocusFromRange(this, range, selectionIsBackward(this.nativeSelection));
                                this.isCollapsed = selectionIsCollapsed(this);
                            } else {
                                // The range was not added successfully. The simplest thing is to refresh
                                this.refresh();
                            }
                        }
                    }
                };
            } else {
                selProto.addRange = function(range, direction) {
                    if (isDirectionBackward(direction) && selectionHasExtend) {
                        addRangeBackward(this, range);
                    } else {
                        this.nativeSelection.addRange(getNativeRange(range));
                        this.refresh();
                    }
                };
            }

            selProto.setRanges = function(ranges) {
                if (implementsControlRange && implementsDocSelection && ranges.length > 1) {
                    createControlSelection(this, ranges);
                } else {
                    this.removeAllRanges();
                    for (var i = 0, len = ranges.length; i < len; ++i) {
                        this.addRange(ranges[i]);
                    }
                }
            };
        } else if (isHostMethod(testSelection, "empty") && isHostMethod(testRange, "select") &&
            implementsControlRange && useDocumentSelection) {

            selProto.removeAllRanges = function() {
                // Added try/catch as fix for issue #21
                try {
                    this.docSelection.empty();

                    // Check for empty() not working (issue #24)
                    if (this.docSelection.type != "None") {
                        // Work around failure to empty a control selection by instead selecting a TextRange and then
                        // calling empty()
                        var doc;
                        if (this.anchorNode) {
                            doc = getDocument(this.anchorNode);
                        } else if (this.docSelection.type == CONTROL) {
                            var controlRange = this.docSelection.createRange();
                            if (controlRange.length) {
                                doc = getDocument( controlRange.item(0) );
                            }
                        }
                        if (doc) {
                            var textRange = getBody(doc).createTextRange();
                            textRange.select();
                            this.docSelection.empty();
                        }
                    }
                } catch(ex) {}
                updateEmptySelection(this);
            };

            selProto.addRange = function(range) {
                if (this.docSelection.type == CONTROL) {
                    addRangeToControlSelection(this, range);
                } else {
                    api.WrappedTextRange.rangeToTextRange(range).select();
                    this._ranges[0] = range;
                    this.rangeCount = 1;
                    this.isCollapsed = this._ranges[0].collapsed;
                    updateAnchorAndFocusFromRange(this, range, false);
                }
            };

            selProto.setRanges = function(ranges) {
                this.removeAllRanges();
                var rangeCount = ranges.length;
                if (rangeCount > 1) {
                    createControlSelection(this, ranges);
                } else if (rangeCount) {
                    this.addRange(ranges[0]);
                }
            };
        } else {
            module.fail("No means of selecting a Range or TextRange was found");
            return false;
        }

        selProto.getRangeAt = function(index) {
            if (index < 0 || index >= this.rangeCount) {
                throw new DOMException("INDEX_SIZE_ERR");
            } else {
                // Clone the range to preserve selection-range independence. See issue 80.
                return this._ranges[index].cloneRange();
            }
        };

        var refreshSelection;

        if (useDocumentSelection) {
            refreshSelection = function(sel) {
                var range;
                if (api.isSelectionValid(sel.win)) {
                    range = sel.docSelection.createRange();
                } else {
                    range = getBody(sel.win.document).createTextRange();
                    range.collapse(true);
                }

                if (sel.docSelection.type == CONTROL) {
                    updateControlSelection(sel);
                } else if (isTextRange(range)) {
                    updateFromTextRange(sel, range);
                } else {
                    updateEmptySelection(sel);
                }
            };
        } else if (isHostMethod(testSelection, "getRangeAt") && typeof testSelection.rangeCount == NUMBER) {
            refreshSelection = function(sel) {
                if (implementsControlRange && implementsDocSelection && sel.docSelection.type == CONTROL) {
                    updateControlSelection(sel);
                } else {
                    sel._ranges.length = sel.rangeCount = sel.nativeSelection.rangeCount;
                    if (sel.rangeCount) {
                        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                            sel._ranges[i] = new api.WrappedRange(sel.nativeSelection.getRangeAt(i));
                        }
                        updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], selectionIsBackward(sel.nativeSelection));
                        sel.isCollapsed = selectionIsCollapsed(sel);
                    } else {
                        updateEmptySelection(sel);
                    }
                }
            };
        } else if (selectionHasAnchorAndFocus && typeof testSelection.isCollapsed == BOOLEAN && typeof testRange.collapsed == BOOLEAN && features.implementsDomRange) {
            refreshSelection = function(sel) {
                var range, nativeSel = sel.nativeSelection;
                if (nativeSel.anchorNode) {
                    range = getSelectionRangeAt(nativeSel, 0);
                    sel._ranges = [range];
                    sel.rangeCount = 1;
                    updateAnchorAndFocusFromNativeSelection(sel);
                    sel.isCollapsed = selectionIsCollapsed(sel);
                } else {
                    updateEmptySelection(sel);
                }
            };
        } else {
            module.fail("No means of obtaining a Range or TextRange from the user's selection was found");
            return false;
        }

        selProto.refresh = function(checkForChanges) {
            var oldRanges = checkForChanges ? this._ranges.slice(0) : null;
            var oldAnchorNode = this.anchorNode, oldAnchorOffset = this.anchorOffset;

            refreshSelection(this);
            if (checkForChanges) {
                // Check the range count first
                var i = oldRanges.length;
                if (i != this._ranges.length) {
                    return true;
                }

                // Now check the direction. Checking the anchor position is the same is enough since we're checking all the
                // ranges after this
                if (this.anchorNode != oldAnchorNode || this.anchorOffset != oldAnchorOffset) {
                    return true;
                }

                // Finally, compare each range in turn
                while (i--) {
                    if (!rangesEqual(oldRanges[i], this._ranges[i])) {
                        return true;
                    }
                }
                return false;
            }
        };

        // Removal of a single range
        var removeRangeManually = function(sel, range) {
            var ranges = sel.getAllRanges();
            sel.removeAllRanges();
            for (var i = 0, len = ranges.length; i < len; ++i) {
                if (!rangesEqual(range, ranges[i])) {
                    sel.addRange(ranges[i]);
                }
            }
            if (!sel.rangeCount) {
                updateEmptySelection(sel);
            }
        };

        if (implementsControlRange && implementsDocSelection) {
            selProto.removeRange = function(range) {
                if (this.docSelection.type == CONTROL) {
                    var controlRange = this.docSelection.createRange();
                    var rangeElement = getSingleElementFromRange(range);

                    // Create a new ControlRange containing all the elements in the selected ControlRange minus the
                    // element contained by the supplied range
                    var doc = getDocument(controlRange.item(0));
                    var newControlRange = getBody(doc).createControlRange();
                    var el, removed = false;
                    for (var i = 0, len = controlRange.length; i < len; ++i) {
                        el = controlRange.item(i);
                        if (el !== rangeElement || removed) {
                            newControlRange.add(controlRange.item(i));
                        } else {
                            removed = true;
                        }
                    }
                    newControlRange.select();

                    // Update the wrapped selection based on what's now in the native selection
                    updateControlSelection(this);
                } else {
                    removeRangeManually(this, range);
                }
            };
        } else {
            selProto.removeRange = function(range) {
                removeRangeManually(this, range);
            };
        }

        // Detecting if a selection is backward
        var selectionIsBackward;
        if (!useDocumentSelection && selectionHasAnchorAndFocus && features.implementsDomRange) {
            selectionIsBackward = winSelectionIsBackward;

            selProto.isBackward = function() {
                return selectionIsBackward(this);
            };
        } else {
            selectionIsBackward = selProto.isBackward = function() {
                return false;
            };
        }

        // Create an alias for backwards compatibility. From 1.3, everything is "backward" rather than "backwards"
        selProto.isBackwards = selProto.isBackward;

        // Selection stringifier
        // This is conformant to the old HTML5 selections draft spec but differs from WebKit and Mozilla's implementation.
        // The current spec does not yet define this method.
        selProto.toString = function() {
            var rangeTexts = [];
            for (var i = 0, len = this.rangeCount; i < len; ++i) {
                rangeTexts[i] = "" + this._ranges[i];
            }
            return rangeTexts.join("");
        };

        function assertNodeInSameDocument(sel, node) {
            if (sel.win.document != getDocument(node)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }
        }

        // No current browser conforms fully to the spec for this method, so Rangy's own method is always used
        selProto.collapse = function(node, offset) {
            assertNodeInSameDocument(this, node);
            var range = api.createRange(node);
            range.collapseToPoint(node, offset);
            this.setSingleRange(range);
            this.isCollapsed = true;
        };

        selProto.collapseToStart = function() {
            if (this.rangeCount) {
                var range = this._ranges[0];
                this.collapse(range.startContainer, range.startOffset);
            } else {
                throw new DOMException("INVALID_STATE_ERR");
            }
        };

        selProto.collapseToEnd = function() {
            if (this.rangeCount) {
                var range = this._ranges[this.rangeCount - 1];
                this.collapse(range.endContainer, range.endOffset);
            } else {
                throw new DOMException("INVALID_STATE_ERR");
            }
        };

        // The spec is very specific on how selectAllChildren should be implemented and not all browsers implement it as
        // specified so the native implementation is never used by Rangy.
        selProto.selectAllChildren = function(node) {
            assertNodeInSameDocument(this, node);
            var range = api.createRange(node);
            range.selectNodeContents(node);
            this.setSingleRange(range);
        };

        selProto.deleteFromDocument = function() {
            // Sepcial behaviour required for IE's control selections
            if (implementsControlRange && implementsDocSelection && this.docSelection.type == CONTROL) {
                var controlRange = this.docSelection.createRange();
                var element;
                while (controlRange.length) {
                    element = controlRange.item(0);
                    controlRange.remove(element);
                    dom.removeNode(element);
                }
                this.refresh();
            } else if (this.rangeCount) {
                var ranges = this.getAllRanges();
                if (ranges.length) {
                    this.removeAllRanges();
                    for (var i = 0, len = ranges.length; i < len; ++i) {
                        ranges[i].deleteContents();
                    }
                    // The spec says nothing about what the selection should contain after calling deleteContents on each
                    // range. Firefox moves the selection to where the final selected range was, so we emulate that
                    this.addRange(ranges[len - 1]);
                }
            }
        };

        // The following are non-standard extensions
        selProto.eachRange = function(func, returnValue) {
            for (var i = 0, len = this._ranges.length; i < len; ++i) {
                if ( func( this.getRangeAt(i) ) ) {
                    return returnValue;
                }
            }
        };

        selProto.getAllRanges = function() {
            var ranges = [];
            this.eachRange(function(range) {
                ranges.push(range);
            });
            return ranges;
        };

        selProto.setSingleRange = function(range, direction) {
            this.removeAllRanges();
            this.addRange(range, direction);
        };

        selProto.callMethodOnEachRange = function(methodName, params) {
            var results = [];
            this.eachRange( function(range) {
                results.push( range[methodName].apply(range, params || []) );
            } );
            return results;
        };

        function createStartOrEndSetter(isStart) {
            return function(node, offset) {
                var range;
                if (this.rangeCount) {
                    range = this.getRangeAt(0);
                    range["set" + (isStart ? "Start" : "End")](node, offset);
                } else {
                    range = api.createRange(this.win.document);
                    range.setStartAndEnd(node, offset);
                }
                this.setSingleRange(range, this.isBackward());
            };
        }

        selProto.setStart = createStartOrEndSetter(true);
        selProto.setEnd = createStartOrEndSetter(false);

        // Add select() method to Range prototype. Any existing selection will be removed.
        api.rangePrototype.select = function(direction) {
            getSelection( this.getDocument() ).setSingleRange(this, direction);
        };

        selProto.changeEachRange = function(func) {
            var ranges = [];
            var backward = this.isBackward();

            this.eachRange(function(range) {
                func(range);
                ranges.push(range);
            });

            this.removeAllRanges();
            if (backward && ranges.length == 1) {
                this.addRange(ranges[0], "backward");
            } else {
                this.setRanges(ranges);
            }
        };

        selProto.containsNode = function(node, allowPartial) {
            return this.eachRange( function(range) {
                    return range.containsNode(node, allowPartial);
                }, true ) || false;
        };

        selProto.getBookmark = function(containerNode) {
            return {
                backward: this.isBackward(),
                rangeBookmarks: this.callMethodOnEachRange("getBookmark", [containerNode])
            };
        };

        selProto.moveToBookmark = function(bookmark) {
            var selRanges = [];
            for (var i = 0, rangeBookmark, range; rangeBookmark = bookmark.rangeBookmarks[i++]; ) {
                range = api.createRange(this.win);
                range.moveToBookmark(rangeBookmark);
                selRanges.push(range);
            }
            if (bookmark.backward) {
                this.setSingleRange(selRanges[0], "backward");
            } else {
                this.setRanges(selRanges);
            }
        };

        selProto.saveRanges = function() {
            return {
                backward: this.isBackward(),
                ranges: this.callMethodOnEachRange("cloneRange")
            };
        };

        selProto.restoreRanges = function(selRanges) {
            this.removeAllRanges();
            for (var i = 0, range; range = selRanges.ranges[i]; ++i) {
                this.addRange(range, (selRanges.backward && i == 0));
            }
        };

        selProto.toHtml = function() {
            var rangeHtmls = [];
            this.eachRange(function(range) {
                rangeHtmls.push( DomRange.toHtml(range) );
            });
            return rangeHtmls.join("");
        };

        if (features.implementsTextRange) {
            selProto.getNativeTextRange = function() {
                var sel, textRange;
                if ( (sel = this.docSelection) ) {
                    var range = sel.createRange();
                    if (isTextRange(range)) {
                        return range;
                    } else {
                        throw module.createError("getNativeTextRange: selection is a control selection");
                    }
                } else if (this.rangeCount > 0) {
                    return api.WrappedTextRange.rangeToTextRange( this.getRangeAt(0) );
                } else {
                    throw module.createError("getNativeTextRange: selection contains no range");
                }
            };
        }

        function inspect(sel) {
            var rangeInspects = [];
            var anchor = new DomPosition(sel.anchorNode, sel.anchorOffset);
            var focus = new DomPosition(sel.focusNode, sel.focusOffset);
            var name = (typeof sel.getName == "function") ? sel.getName() : "Selection";

            if (typeof sel.rangeCount != "undefined") {
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    rangeInspects[i] = DomRange.inspect(sel.getRangeAt(i));
                }
            }
            return "[" + name + "(Ranges: " + rangeInspects.join(", ") +
                ")(anchor: " + anchor.inspect() + ", focus: " + focus.inspect() + "]";
        }

        selProto.getName = function() {
            return "WrappedSelection";
        };

        selProto.inspect = function() {
            return inspect(this);
        };

        selProto.detach = function() {
            actOnCachedSelection(this.win, "delete");
            deleteProperties(this);
        };

        WrappedSelection.detachAll = function() {
            actOnCachedSelection(null, "deleteAll");
        };

        WrappedSelection.inspect = inspect;
        WrappedSelection.isDirectionBackward = isDirectionBackward;

        api.Selection = WrappedSelection;

        api.selectionPrototype = selProto;

        api.addShimListener(function(win) {
            if (typeof win.getSelection == "undefined") {
                win.getSelection = function() {
                    return getSelection(win);
                };
            }
            win = null;
        });
    });


    /*----------------------------------------------------------------------------------------------------------------*/

    // Wait for document to load before initializing
    var docReady = false;

    var loadHandler = function(e) {
        if (!docReady) {
            docReady = true;
            if (!api.initialized && api.config.autoInitialize) {
                init();
            }
        }
    };

    if (isBrowser) {
        // Test whether the document has already been loaded and initialize immediately if so
        if (document.readyState == "complete") {
            loadHandler();
        } else {
            if (isHostMethod(document, "addEventListener")) {
                document.addEventListener("DOMContentLoaded", loadHandler, false);
            }

            // Add a fallback in case the DOMContentLoaded event isn't supported
            addListener(window, "load", loadHandler);
        }
    }

    return api;
}, this);
/**
 * Created by supostat on 10.11.15.
 */
/*
 Rangy Text Inputs, a cross-browser textarea and text input library plug-in for jQuery.

 Part of Rangy, a cross-browser JavaScript range and selection library
 http://code.google.com/p/rangy/

 Depends on jQuery 1.0 or later.

 Copyright 2010, Tim Down
 Licensed under the MIT license.
 Version: 0.1.205
 Build date: 5 November 2010
 */
(function(n){function o(e,g){var a=typeof e[g];return a==="function"||!!(a=="object"&&e[g])||a=="unknown"}function p(e,g,a){if(g<0)g+=e.value.length;if(typeof a=="undefined")a=g;if(a<0)a+=e.value.length;return{start:g,end:a}}function k(){return typeof document.body=="object"&&document.body?document.body:document.getElementsByTagName("body")[0]}var i,h,q,l,r,s,t,u,m;n(document).ready(function(){function e(a,b){return function(){var c=this.jquery?this[0]:this,d=c.nodeName.toLowerCase();if(c.nodeType==
    1&&(d=="textarea"||d=="input"&&c.type=="text")){c=[c].concat(Array.prototype.slice.call(arguments));c=a.apply(this,c);if(!b)return c}if(b)return this}}var g=document.createElement("textarea");k().appendChild(g);if(typeof g.selectionStart!="undefined"&&typeof g.selectionEnd!="undefined"){i=function(a){return{start:a.selectionStart,end:a.selectionEnd,length:a.selectionEnd-a.selectionStart,text:a.value.slice(a.selectionStart,a.selectionEnd)}};h=function(a,b,c){b=p(a,b,c);a.selectionStart=b.start;a.selectionEnd=
    b.end};m=function(a,b){if(b)a.selectionEnd=a.selectionStart;else a.selectionStart=a.selectionEnd}}else if(o(g,"createTextRange")&&typeof document.selection=="object"&&document.selection&&o(document.selection,"createRange")){i=function(a){var b=0,c=0,d,f,j;if((j=document.selection.createRange())&&j.parentElement()==a){f=a.value.length;d=a.value.replace(/\r\n/g,"\n");c=a.createTextRange();c.moveToBookmark(j.getBookmark());j=a.createTextRange();j.collapse(false);if(c.compareEndPoints("StartToEnd",j)>
    -1)b=c=f;else{b=-c.moveStart("character",-f);b+=d.slice(0,b).split("\n").length-1;if(c.compareEndPoints("EndToEnd",j)>-1)c=f;else{c=-c.moveEnd("character",-f);c+=d.slice(0,c).split("\n").length-1}}}return{start:b,end:c,length:c-b,text:a.value.slice(b,c)}};h=function(a,b,c){b=p(a,b,c);c=a.createTextRange();var d=b.start-(a.value.slice(0,b.start).split("\r\n").length-1);c.collapse(true);if(b.start==b.end)c.move("character",d);else{c.moveEnd("character",b.end-(a.value.slice(0,b.end).split("\r\n").length-
    1));c.moveStart("character",d)}c.select()};m=function(a,b){var c=document.selection.createRange();c.collapse(b);c.select()}}else{k().removeChild(g);window.console&&window.console.log&&window.console.log("TextInputs module for Rangy not supported in your browser. Reason: No means of finding text input caret position");return}k().removeChild(g);l=function(a,b,c,d){var f;if(b!=c){f=a.value;a.value=f.slice(0,b)+f.slice(c)}d&&h(a,b,b)};q=function(a){var b=i(a);l(a,b.start,b.end,true)};u=function(a){var b=
    i(a),c;if(b.start!=b.end){c=a.value;a.value=c.slice(0,b.start)+c.slice(b.end)}h(a,b.start,b.start);return b.text};r=function(a,b,c,d){var f=a.value;a.value=f.slice(0,c)+b+f.slice(c);if(d){b=c+b.length;h(a,b,b)}};s=function(a,b){var c=i(a),d=a.value;a.value=d.slice(0,c.start)+b+d.slice(c.end);c=c.start+b.length;h(a,c,c)};t=function(a,b,c){var d=i(a),f=a.value;a.value=f.slice(0,d.start)+b+d.text+c+f.slice(d.end);b=d.start+b.length;h(a,b,b+d.length)};n.fn.extend({getSelection:e(i,false),setSelection:e(h,
    true),collapseSelection:e(m,true),deleteSelectedText:e(q,true),deleteText:e(l,true),extractSelectedText:e(u,false),insertText:e(r,true),replaceSelectedText:e(s,true),surroundSelectedText:e(t,true)})})})(jQuery);
/**
 * Created by supostat on 10.11.15.
 */


/*
 Copyright (C) 2012 Christian Perfect

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function() {

    function saveSelection(containerEl) {
        var charIndex = 0, start = 0, end = 0, foundStart = false, stop = {};
        var sel = rangy.getSelection(), range;

        function traverseTextNodes(node, range) {
            if (node.nodeType == 3) {
                if (!foundStart && node == range.startContainer) {
                    start = charIndex + range.startOffset;
                    foundStart = true;
                }
                if (foundStart && node == range.endContainer) {
                    end = charIndex + range.endOffset;
                    throw stop;
                }
                charIndex += node.length;
            } else {
                for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                    traverseTextNodes(node.childNodes[i], range);
                }
            }
        }

        if (sel.rangeCount) {
            try {
                traverseTextNodes(containerEl, sel.getRangeAt(0));
            } catch (ex) {
                if (ex != stop) {
                    throw ex;
                }
            }
        }

        return {
            start: start,
            end: end
        };
    }

    function restoreSelection(containerEl, savedSel) {
        var charIndex = 0, range = rangy.createRange(), foundStart = false, stop = {};
        range.collapseToPoint(containerEl, 0);

        function traverseTextNodes(node) {
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                    range.setEnd(node, savedSel.end - charIndex);
                    throw stop;
                }
                charIndex = nextCharIndex;
            } else {
                for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                    traverseTextNodes(node.childNodes[i]);
                }
            }
        }

        try {
            traverseTextNodes(containerEl);
        } catch (ex) {
            if (ex == stop) {
                rangy.getSelection().setSingleRange(range);
            } else {
                throw ex;
            }
        }
    }

    var endDelimiters = {
        '$!': /[^\\]\$!/,
        '\\(': /[^\\]\\\)/,
        '$$': /[^\\]\$\$/,
        '\\[': /[^\\]\\\]/
    }
    var re_startMaths = /(?:^|[^\\])\$\$|(?:^|[^\\])\$!|\\\(|\\\[|\\begin\{(\w+)\}/;
    function findMaths(txt,target) {
        var i = 0;
        var m;
        var startDelimiter, endDelimiter;
        var start, end;
        var startChop, endChop;
        var re_end;

        while(txt.length) {
            m = re_startMaths.exec(txt);

            if(!m)     // if no maths delimiters, target is not in a maths section
                return null;

            startDelimiter = m[0];
            var start = m.index;

            if(i+start >= target)    // if target was before the starting delimiter, it's not in a maths section
                return null;

            startChop = start+startDelimiter.length;
            txt = txt.slice(startChop);

            if(startDelimiter.match(/^\\begin/)) {    //if this is an environment, construct a regexp to find the corresponding \end{} command.
                var environment = m[1];
                re_end = new RegExp('[^\\\\]\\\\end\\{'+environment+'\\}');    // don't ask if this copes with nested environments
            }
            else if(startDelimiter.match(/.\$\$/)) {
                re_end = endDelimiters[startDelimiter.slice(1)];
            } else {
                re_end = endDelimiters[startDelimiter];    // get the corresponding end delimiter for the matched start delimiter
            }

            m = re_end.exec(txt);

            if(!m) {    // if no ending delimiter, target is in a maths section
                return {
                    start: i+start,
                    end: i+startChop+txt.length,
                    math: txt,
                    startDelimiter: startDelimiter,
                    endDelimiter: endDelimiter
                };
            }

            endDelimiter = m[0];
            var end = m.index+1;    // the end delimiter regexp has a "not a backslash" character at the start because JS regexps don't do negative lookbehind
            endChop = end+endDelimiter.length-1;
            if(i+startChop+end >= target) {    // if target is before the end delimiter, it's in a maths section
                return {
                    start: i+start,
                    end: i+startChop+endChop,
                    math: txt.slice(0,end),
                    startDelimiter: startDelimiter,
                    endDelimiter: endDelimiter.slice(1)
                };
            }
            else {
                txt = txt.slice(endChop);
                i += startChop+endChop;
            }
        }
    }

    jQuery(function() {
        jQuery("<style type='text/css'> .wm_preview { z-index: 1; position: absolute; display: none; border: 1px solid; padding: 0.2em; width: auto; margin: 0 auto; background: white;} </style>").appendTo("head");

        jQuery.fn.writemaths = function(custom_options) {

            jQuery(this).each(function() {
                var options = jQuery.extend({
                    cleanMaths: function(m){ return m; },
                    callback: function() {},
                    iFrame: false,
                    position: 'right top',
                    previewPosition: 'left top'
                },custom_options);

                var textarea = jQuery(this).is('textarea,input');

                var root = this;
                var el;
                var iframe;

                if(options.of=='this')
                    options.of = root;

                if(options.iFrame) {
                    iframe = jQuery(this).find('iframe')[0];
                    el = jQuery(iframe).contents().find('body');
                }
                else
                {
                    el = jQuery(this);
                }
                el.addClass('writemaths tex2jax_ignore');
                var previewElement = jQuery('<div class="wm_preview"/>');
                jQuery('body').append(previewElement);

                var queue = MathJax.Callback.Queue(MathJax.Hub.Register.StartupHook("End",{}));

                var txt, sel, range;
                function positionPreview() {
                    var of = options.of ? options.of : options.iFrame ? iframe : textarea ? root : document;
                    previewElement.position({my: options.previewPosition, at: options.position, of: of, collision: 'fit'})
                }

                function updatePreview(e) {
                    previewElement.hide();

                    if(textarea) {
                        sel = jQuery(this).getSelection();
                        range = {startOffset: sel.start, endOffset: sel.end};
                        txt = jQuery(this).val();
                    }
                    else {
                        sel = options.iFrame ? rangy.getSelection(iframe) : rangy.getSelection();
                        var anchor = sel.anchorNode;

                        range = sel.getRangeAt(0);

                        if(anchor.nodeType == anchor.TEXT_NODE) {
                            while(anchor.previousSibling) {
                                anchor = anchor.previousSibling;
                                range.startOffset += anchor.textContent.length;
                                range.endOffset += anchor.textContent.length;
                            }
                            anchor = anchor.parentNode;
                        }

                        if(jQuery(anchor).add(jQuery(anchor).parents()).filter('code,pre,.wm_ignore').length)
                            return;
                        txt = jQuery(anchor).text();
                    }

                    //only do this if the selection has zero width
                    //so when you're selecting blocks of text, distracting previews don't pop up
                    if(range.startOffset != range.endOffset)
                        return;

                    var target = range.startOffset;

                    var q = findMaths(txt,target);

                    if(!q)
                        return;

                    var math;
                    if(q.startDelimiter.match(/^\\begin/))
                        math = q.startDelimiter + q.math + (q.endDelimiter ? q.endDelimiter : '');
                    else
                        math = q.math;

                    if(!math.length)
                        return;

                    previewElement.show();

                    if(math!=$(this).data('writemaths-lastMath')) {
                        var script = document.createElement('script');
                        script.setAttribute('type','math/tex');
                        script.textContent = options.cleanMaths(math);
                        previewElement.html(script);
                        $(this).data('writemaths-lastMath',math);
                        queue.Push(['Typeset',MathJax.Hub,previewElement[0]]);
                        queue.Push(positionPreview);
                        queue.Push(options.callback);
                    }

                    positionPreview();

                }

                updatePreview = $.throttle(100,updatePreview);


                // periodically check the iFrame still exists
                if(options.iFrame) {
                    function still_there() {
                        if(!jQuery(iframe).parents('html').length) {
                            previewElement.remove();
                            clearInterval(still_there_interval);
                            el.off();
                        }
                    }
                    var still_there_interval = setInterval(still_there,100);
                }

                el
                    .on('blur',function(e) {
                        previewElement.hide();
                    })
                    .on('keyup click',updatePreview);
                if(options.iFrame)
                    $(el[0].ownerDocument).on('scroll',updatePreview);
                else
                    el.on('scroll',updatePreview);

            });
            return this;
        }
    });

    /*
     * jQuery throttle / debounce - v1.1 - 3/7/2010
     * http://benalman.com/projects/jquery-throttle-debounce-plugin/
     *
     * Copyright (c) 2010 "Cowboy" Ben Alman
     * Dual licensed under the MIT and GPL licenses.
     * http://benalman.com/about/license/
     */
    (function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);
})();
(function () {
    function t() {
    }

    function e(t) {
        var e = o.call(arguments, 1);
        return function () {
            return t.apply(this, e)
        }
    }

    function n(t, e) {
        if (!e)throw Error("prayer failed: " + t)
    }

    function i(t) {
        n("a direction was passed", t === u || t === p)
    }

    function r(e, n, i, r) {
        function s() {
            g = a;
            var t = c.selection ? "$" + c.selection.latex() + "$" : "";
            w.select(t)
        }

        function o() {
            l.detach()
        }

        var c, l, m, g, b, v, w, x = e.contents().detach();
        return i || e.addClass("mathquill-rendered-math"), n.jQ = e.attr(ce, n.id), n.revert = function () {
            e.empty().unbind(".mathquill").removeClass("mathquill-rendered-math mathquill-editable mathquill-textbox").append(x)
        }, c = n.cursor = re(n), n.renderLatex(x.text()), l = n.textarea = f('<span class="textarea"><textarea></textarea></span>'), m = l.children(), n.selectionChanged = function () {
            g === a && (g = setTimeout(s)), O(e[0])
        }, e.bind("selectstart.mathquill", function (t) {
            t.target !== m[0] && t.preventDefault(), t.stopPropagation()
        }), v = c.blink, e.bind("mousedown.mathquill", function (n) {
            function i(t) {
                return c.seek(f(t.target), t.pageX, t.pageY), (c[u] !== b[u] || c.parent !== b.parent) && c.selectFrom(b), !1
            }

            function s(t) {
                return delete t.target, i(t)
            }

            function o(t) {
                b = a, c.blink = v, c.selection || (r ? c.show() : l.detach()), e.unbind("mousemove", i), f(t.target.ownerDocument).unbind("mousemove", s).unbind("mouseup", o)
            }

            return setTimeout(function () {
                m.focus()
            }), c.blink = t, c.seek(f(n.target), n.pageX, n.pageY), b = d(c.parent, c[u], c[p]), r || e.prepend(l), e.mousemove(i), f(n.target.ownerDocument).mousemove(s).mouseup(o), !1
        }), r ? (w = h(m, {
            container: e, key: function (t, e) {
                c.parent.bubble("onKey", t, e)
            }, text: function (t) {
                c.parent.bubble("onText", t)
            }, cut: function (t) {
                c.selection && setTimeout(function () {
                    c.prepareEdit(), c.parent.bubble("redraw")
                }), t.stopPropagation()
            }, paste: function (t) {
                t = "$" === t.slice(0, 1) && "$" === t.slice(-1) ? t.slice(1, -1) : "\\text{" + t + "}", c.writeLatex(t).show()
            }
        }), e.prepend(l), e.addClass("mathquill-editable"), i && e.addClass("mathquill-textbox"), m.focus(function (t) {
            c.parent || c.insAtRightEnd(n), c.parent.jQ.addClass("hasCursor"), c.selection ? (c.selection.jQ.removeClass("blur"), setTimeout(n.selectionChanged)) : c.show(), t.stopPropagation()
        }).blur(function (t) {
            c.hide().parent.blur(), c.selection && c.selection.jQ.addClass("blur"), t.stopPropagation()
        }), e.bind("focus.mathquill blur.mathquill", function (t) {
            m.trigger(t)
        }).blur(), a) : (w = h(m, {container: e}), e.bind("cut paste", !1).bind("copy", s).prepend('<span class="selectable">$' + n.latex() + "$</span>"), m.blur(function () {
            c.clearSelection(), setTimeout(o)
        }), a)
    }

    function s(t, e, n) {
        return c(K, {ctrlSeq: t, htmlTemplate: "<" + e + " " + n + ">&0</" + e + ">"})
    }

    var a, o, c, h, l, u, p, f, d, m, g, b, v, w, x, j, k, q, y, Q, C, S, L, D, O, E, A, R, T, z, B, I, $, _, W, M, F, P, U, H, K, N, G, X, Z, Y, J, V, te, ee, ne, ie, re, se, ae = window.jQuery, oe = "mathquill-command-id", ce = "mathquill-block-id", he = Math.min;
    Math.max, o = [].slice, c = function (t, e, n) {
        function i(t) {
            return "object" == typeof t
        }

        function r(t) {
            return "function" == typeof t
        }

        function s() {
        }

        function a(o, c) {
            function h() {
                var t = new l;
                return r(t.init) && t.init.apply(t, arguments), t
            }

            function l() {
            }

            var u, p, f;
            return c === n && (c = o, o = Object), h.Bare = l, u = s[t] = o[t], p = l[t] = h[t] = new s, p.constructor = h, h.mixin = function (e) {
                return l[t] = h[t] = a(h, e)[t], h
            }, (h.open = function (t) {
                if (f = {}, r(t) ? f = t.call(h, p, u, h, o) : i(t) && (f = t), i(f))for (var n in f)e.call(f, n) && (p[n] = f[n]);
                return r(p.init) || (p.init = o), h
            })(c)
        }

        return a
    }("prototype", {}.hasOwnProperty), h = function () {
        function e(t) {
            var e, i = t.which || t.keyCode, r = n[i], s = [];
            return t.ctrlKey && s.push("Ctrl"), t.originalEvent && t.originalEvent.metaKey && s.push("Meta"), t.altKey && s.push("Alt"), t.shiftKey && s.push("Shift"), e = r || String.fromCharCode(i), s.length || r ? (s.push(e), s.join("-")) : e
        }

        var n = {
            8: "Backspace",
            9: "Tab",
            10: "Enter",
            13: "Enter",
            16: "Shift",
            17: "Control",
            18: "Alt",
            20: "CapsLock",
            27: "Esc",
            32: "Spacebar",
            33: "PageUp",
            34: "PageDown",
            35: "End",
            36: "Home",
            37: "Left",
            38: "Up",
            39: "Right",
            40: "Down",
            45: "Insert",
            46: "Del",
            144: "NumLock"
        };
        return function (n, i) {
            function r(t) {
                k = t, clearTimeout(j), j = setTimeout(t)
            }

            function s(e) {
                k(), k = t, clearTimeout(j), w.val(e), e && w[0].select()
            }

            function a() {
                var t = w[0];
                return "selectionStart"in t ? t.selectionStart !== t.selectionEnd : !1
            }

            function o(t) {
                var e = w.val();
                w.val(""), e && t(e)
            }

            function c() {
                g(e(q), q)
            }

            function h(t) {
                q = t, y = null, c()
            }

            function l(t) {
                q && y && c(), y = t, r(u)
            }

            function u() {
                a() || o(m)
            }

            function p() {
                q = y = null
            }

            function f() {
                w.focus(), r(d)
            }

            function d() {
                o(b)
            }

            var m, g, b, v, w, x, j, k, q = null, y = null;
            return i || (i = {}), m = i.text || t, g = i.key || t, b = i.paste || t, v = i.cut || t, w = ae(n), x = ae(i.container || w), k = t, x.bind("keydown keypress input keyup focusout paste", function () {
                k()
            }), x.bind({keydown: h, keypress: l, focusout: p, cut: v, paste: f}), {select: s}
        }
    }(), l = c(function (t, e, i) {
        function r(t, e) {
            throw t = t ? "'" + t + "'" : "EOF", "Parse Error: " + e + " at " + t
        }

        var s, a, o;
        t.init = function (t) {
            this._ = t
        }, t.parse = function (t) {
            function e(t, e) {
                return e
            }

            return this.skip(o)._(t, e, r)
        }, t.or = function (t) {
            n("or is passed a parser", t instanceof i);
            var e = this;
            return i(function (n, i, r) {
                function s() {
                    return t._(n, i, r)
                }

                return e._(n, i, s)
            })
        }, t.then = function (t) {
            var e = this;
            return i(function (r, s, a) {
                function o(e, r) {
                    var o = t instanceof i ? t : t(r);
                    return n("a parser is returned", o instanceof i), o._(e, s, a)
                }

                return e._(r, o, a)
            })
        }, t.many = function () {
            var t = this;
            return i(function (e, n) {
                function i(t, n) {
                    return e = t, s.push(n), !0
                }

                function r() {
                    return !1
                }

                for (var s = []; t._(e, i, r););
                return n(e, s)
            })
        }, t.times = function (t, e) {
            2 > arguments.length && (e = t);
            var n = this;
            return i(function (i, r, s) {
                function a(t, e) {
                    return u.push(e), i = t, !0
                }

                function o(t, e) {
                    return h = e, i = t, !1
                }

                function c() {
                    return !1
                }

                var h, l, u = [], p = !0;
                for (l = 0; t > l; l += 1)if (p = n._(i, a, o), !p)return s(i, h);
                for (; e > l && p; l += 1)p = n._(i, a, c);
                return r(i, u)
            })
        }, t.result = function (t) {
            return this.then(a(t))
        }, t.atMost = function (t) {
            return this.times(0, t)
        }, t.atLeast = function (t) {
            var e = this;
            return e.times(t).then(function (t) {
                return e.many().map(function (e) {
                    return t.concat(e)
                })
            })
        }, t.map = function (t) {
            return this.then(function (e) {
                return a(t(e))
            })
        }, t.skip = function (t) {
            return this.then(function (e) {
                return t.result(e)
            })
        }, this.string = function (t) {
            var e = t.length, n = "expected '" + t + "'";
            return i(function (i, r, s) {
                var a = i.slice(0, e);
                return a === t ? r(i.slice(e), a) : s(i, n)
            })
        }, s = this.regex = function (t) {
            n("regexp parser is anchored", "^" === ("" + t).charAt(1));
            var e = "expected " + t;
            return i(function (n, i, r) {
                var s, a = t.exec(n);
                return a ? (s = a[0], i(n.slice(s.length), s)) : r(n, e)
            })
        }, a = i.succeed = function (t) {
            return i(function (e, n) {
                return n(e, t)
            })
        }, i.fail = function (t) {
            return i(function (e, n, i) {
                return i(e, t)
            })
        }, i.letter = s(/^[a-z]/i), i.letters = s(/^[a-z]*/i), i.digit = s(/^[0-9]/), i.digits = s(/^[0-9]*/), i.whitespace = s(/^\s+/), i.optWhitespace = s(/^\s*/), i.any = i(function (t, e, n) {
            return t ? e(t.slice(1), t.charAt(0)) : n(t, "expected any character")
        }), i.all = i(function (t, e) {
            return e("", t)
        }), o = i.eof = i(function (t, e, n) {
            return t ? n(t, "expected EOF") : e(t, t)
        })
    }), u = -1, p = 1, f = c(ae, function (t) {
        t.insDirOf = function (t, e) {
            return t === u ? this.insertBefore(e.first()) : this.insertAfter(e.last())
        }, t.insAtDirEnd = function (t, e) {
            return t === u ? this.prependTo(e) : this.appendTo(e)
        }
    }), d = c(function (t) {
        t.parent = 0, t[u] = 0, t[p] = 0, t.init = function (t, e, n) {
            this.parent = t, this[u] = e, this[p] = n
        }
    }), m = c(function (t) {
        t[u] = 0, t[p] = 0, t.parent = 0, t.init = function () {
            this.ends = {}, this.ends[u] = 0, this.ends[p] = 0
        }, t.children = function () {
            return g(this.ends[u], this.ends[p])
        }, t.eachChild = function (t) {
            return this.children().each(t)
        }, t.foldChildren = function (t, e) {
            return this.children().fold(t, e)
        }, t.adopt = function (t, e, n) {
            return g(this, this).adopt(t, e, n), this
        }, t.disown = function () {
            return g(this, this).disown(), this
        }
    }), g = c(function (t) {
        function e(t, e, i) {
            n("a parent is always present", t), n("leftward is properly set up", function () {
                return e ? e[p] === i && e.parent === t : t.ends[u] === i
            }()), n("rightward is properly set up", function () {
                return i ? i[u] === e && i.parent === t : t.ends[p] === e
            }())
        }

        t.init = function (t, e) {
            n("no half-empty fragments", !t == !e), this.ends = {}, t && (n("left end node is passed to Fragment", t instanceof m), n("right end node is passed to Fragment", e instanceof m), n("leftEnd and rightEnd have the same parent", t.parent === e.parent), this.ends[u] = t, this.ends[p] = e)
        }, t.adopt = function (t, n, i) {
            var r, s, a;
            return e(t, n, i), r = this, r.disowned = !1, (s = r.ends[u]) ? (a = r.ends[p], n || (t.ends[u] = s), i ? i[u] = a : t.ends[p] = a, r.ends[p][p] = i, r.each(function (e) {
                e[u] = n, e.parent = t, n && (n[p] = e), n = e
            }), r) : this
        }, t.disown = function () {
            var t, n, i = this, r = i.ends[u];
            return !r || i.disowned ? i : (i.disowned = !0, t = i.ends[p], n = r.parent, e(n, r[u], r), e(n, t, t[p]), r[u] ? r[u][p] = t[p] : n.ends[u] = t[p], t[p] ? t[p][u] = r[u] : n.ends[p] = r[u], i)
        }, t.each = function (t) {
            var e = this, n = e.ends[u];
            if (!n)return e;
            for (; n !== e.ends[p][p] && t.call(e, n) !== !1; n = n[p]);
            return e
        }, t.fold = function (t, e) {
            return this.each(function (n) {
                t = e.call(this, t, n)
            }), t
        }
    }), b = function () {
        var t = 0;
        return function () {
            return t += 1
        }
    }(), v = c(m, function (t, e) {
        t.init = function () {
            e.init.call(this), this.id = b(), v[this.id] = this
        }, t.toString = function () {
            return "[MathElement " + this.id + "]"
        }, t.bubble = function (t) {
            var e, n, i = o.call(arguments, 1);
            for (e = this; e && (n = e[t] && e[t].apply(e, i), n !== !1); e = e.parent);
            return this
        }, t.postOrder = function (t) {
            var e, n = o.call(arguments, 1);
            "string" == typeof t && (e = t, t = function (t) {
                e in t && t[e].apply(t, n)
            }), function i(e) {
                e.eachChild(i), t(e)
            }(this)
        }, t.jQ = f(), t.jQadd = function (t) {
            this.jQ = this.jQ.add(t)
        }, this.jQize = function (t) {
            var e = f(t);
            return e.find("*").andSelf().each(function () {
                var t = f(this), e = t.attr("mathquill-command-id"), n = t.attr("mathquill-block-id");
                e && v[e].jQadd(t), n && v[n].jQadd(t)
            }), e
        }, t.finalizeInsert = function () {
            var t = this;
            t.postOrder("finalizeTree"), t.postOrder("blur"), t.postOrder("respace"), t[p].respace && t[p].respace(), t[u].respace && t[u].respace(), t.postOrder("redraw"), t.bubble("redraw")
        }
    }), w = c(v, function (e, i) {
        e.init = function (t, e, n) {
            var r = this;
            i.init.call(r), r.ctrlSeq || (r.ctrlSeq = t), e && (r.htmlTemplate = e), n && (r.textTemplate = n)
        }, e.replaces = function (t) {
            t.disown(), this.replacedFragment = t
        }, e.isEmpty = function () {
            return this.foldChildren(!0, function (t, e) {
                return t && e.isEmpty()
            })
        }, e.parser = function () {
            var t = ie.block, e = this;
            return t.times(e.numBlocks()).map(function (t) {
                e.blocks = t;
                for (var n = 0; t.length > n; n += 1)t[n].adopt(e, e.ends[p], 0);
                return e
            })
        }, e.createLeftOf = function (t) {
            var e = this, n = e.replacedFragment;
            e.createBlocks(), v.jQize(e.html()), n && (n.adopt(e.ends[u], 0, 0), n.jQ.appendTo(e.ends[u].jQ)), t.jQ.before(e.jQ), t[u] = e.adopt(t.parent, t[u], t[p]), e.finalizeInsert(t), e.placeCursor(t)
        }, e.createBlocks = function () {
            var t, e, n = this, i = n.numBlocks(), r = n.blocks = Array(i);
            for (t = 0; i > t; t += 1)e = r[t] = j(), e.adopt(n, n.ends[p], 0)
        }, e.respace = t, e.placeCursor = function (t) {
            t.insAtRightEnd(this.foldChildren(this.ends[u], function (t, e) {
                return t.isEmpty() ? t : e
            }))
        }, e.remove = function () {
            return this.disown(), this.jQ.remove(), this.postOrder(function (t) {
                delete v[t.id]
            }), this
        }, e.numBlocks = function () {
            var t = this.htmlTemplate.match(/&\d+/g);
            return t ? t.length : 0
        }, e.html = function () {
            var t, e, i, r = this, s = r.blocks, a = " mathquill-command-id=" + r.id, o = r.htmlTemplate.match(/<[^<>]+>|[^<>]+/g);
            for (n("no unmatched angle brackets", o.join("") === this.htmlTemplate), t = 0, e = o[0]; e; t += 1, e = o[t])if ("/>" === e.slice(-2))o[t] = e.slice(0, -2) + a + "/>"; else if ("<" === e.charAt(0)) {
                n("not an unmatched top-level close tag", "/" !== e.charAt(1)), o[t] = e.slice(0, -1) + a + ">", i = 1;
                do t += 1, e = o[t], n("no missing close tags", e), "</" === e.slice(0, 2) ? i -= 1 : "<" === e.charAt(0) && "/>" !== e.slice(-2) && (i += 1); while (i > 0)
            }
            return o.join("").replace(/>&(\d+)/g, function (t, e) {
                return " mathquill-block-id=" + s[e].id + ">" + s[e].join("html")
            })
        }, e.latex = function () {
            return this.foldChildren(this.ctrlSeq, function (t, e) {
                return t + "{" + (e.latex() || " ") + "}"
            })
        }, e.textTemplate = [""], e.text = function () {
            var t = this, e = 0;
            return t.foldChildren(t.textTemplate[e], function (n, i) {
                e += 1;
                var r = i.text();
                return n && "(" === t.textTemplate[e] && "(" === r[0] && ")" === r.slice(-1) ? n + r.slice(1, -1) + t.textTemplate[e] : n + i.text() + (t.textTemplate[e] || "")
            })
        }
    }), x = c(w, function (e, n) {
        e.init = function (t, e, i) {
            i || (i = t && t.length > 1 ? t.slice(1) : t), n.init.call(this, t, e, [i])
        }, e.parser = function () {
            return l.succeed(this)
        }, e.numBlocks = function () {
            return 0
        }, e.replaces = function (t) {
            t.remove()
        }, e.createBlocks = t, e.latex = function () {
            return this.ctrlSeq
        }, e.text = function () {
            return this.textTemplate
        }, e.placeCursor = t, e.isEmpty = function () {
            return !0
        }
    }), j = c(v, function (t) {
        t.join = function (t) {
            return this.foldChildren("", function (e, n) {
                return e + n[t]()
            })
        }, t.latex = function () {
            return this.join("latex")
        }, t.text = function () {
            return this.ends[u] === this.ends[p] ? this.ends[u].text() : "(" + this.join("text") + ")"
        }, t.isEmpty = function () {
            return 0 === this.ends[u] && 0 === this.ends[p]
        }, t.write = function (t, e, n) {
            var i;
            i = e.match(/^[a-eg-zA-Z]$/) ? X(e) : (i = C[e] || S[e]) ? i(e) : Z(e), n && i.replaces(n), i.createLeftOf(t)
        }, t.focus = function () {
            return this.jQ.addClass("hasCursor"), this.jQ.removeClass("empty"), this
        }, t.blur = function () {
            return this.jQ.removeClass("hasCursor"), this.isEmpty() && this.jQ.addClass("empty"), this
        }
    }), k = c(g, function (t, e) {
        t.init = function (t, n) {
            e.init.call(this, t, n || t), this.jQ = this.fold(f(), function (t, e) {
                return e.jQ.add(t)
            })
        }, t.latex = function () {
            return this.fold("", function (t, e) {
                return t + e.latex()
            })
        }, t.remove = function () {
            return this.jQ.remove(), this.each(function (t) {
                t.postOrder(function (t) {
                    delete v[t.id]
                })
            }), this.disown()
        }
    }), q = c(j, function (t, e) {
        t.latex = function () {
            return e.latex.call(this).replace(/(\\[a-z]+) (?![a-z])/gi, "$1")
        }, t.text = function () {
            return this.foldChildren("", function (t, e) {
                return t + e.text()
            })
        }, t.renderLatex = function (t) {
            var e = this.jQ;
            e.children().slice(1).remove(), this.ends[u] = this.ends[p] = 0, delete this.cursor.selection, this.cursor.insAtRightEnd(this).writeLatex(t)
        }, t.onKey = function (t, e) {
            var n;
            switch (t) {
                case"Ctrl-Shift-Backspace":
                case"Ctrl-Backspace":
                    for (; this.cursor[u] || this.cursor.selection;)this.cursor.backspace();
                    break;
                case"Shift-Backspace":
                case"Backspace":
                    this.cursor.backspace();
                    break;
                case"Esc":
                case"Tab":
                case"Spacebar":
                    if (n = this.cursor.parent, n === this.cursor.root)return "Spacebar" === t && e.preventDefault(), a;
                    this.cursor.prepareMove(), n[p] ? this.cursor.insAtLeftEnd(n[p]) : this.cursor.insRightOf(n.parent);
                    break;
                case"Shift-Tab":
                case"Shift-Esc":
                case"Shift-Spacebar":
                    if (n = this.cursor.parent, n === this.cursor.root)return "Shift-Spacebar" === t && e.preventDefault(), a;
                    this.cursor.prepareMove(), n[u] ? this.cursor.insAtRightEnd(n[u]) : this.cursor.insLeftOf(n.parent);
                    break;
                case"Enter":
                    break;
                case"End":
                    this.cursor.prepareMove().insAtRightEnd(this.cursor.parent);
                    break;
                case"Ctrl-End":
                    this.cursor.prepareMove().insAtRightEnd(this);
                    break;
                case"Shift-End":
                    for (; this.cursor[p];)this.cursor.selectRight();
                    break;
                case"Ctrl-Shift-End":
                    for (; this.cursor[p] || this.cursor.parent !== this;)this.cursor.selectRight();
                    break;
                case"Home":
                    this.cursor.prepareMove().insAtLeftEnd(this.cursor.parent);
                    break;
                case"Ctrl-Home":
                    this.cursor.prepareMove().insAtLeftEnd(this);
                    break;
                case"Shift-Home":
                    for (; this.cursor[u];)this.cursor.selectLeft();
                    break;
                case"Ctrl-Shift-Home":
                    for (; this.cursor[u] || this.cursor.parent !== this;)this.cursor.selectLeft();
                    break;
                case"Left":
                    this.cursor.moveLeft();
                    break;
                case"Shift-Left":
                    this.cursor.selectLeft();
                    break;
                case"Ctrl-Left":
                    break;
                case"Right":
                    this.cursor.moveRight();
                    break;
                case"Shift-Right":
                    this.cursor.selectRight();
                    break;
                case"Ctrl-Right":
                    break;
                case"Up":
                    this.cursor.moveUp();
                    break;
                case"Down":
                    this.cursor.moveDown();
                    break;
                case"Shift-Up":
                    if (this.cursor[u])for (; this.cursor[u];)this.cursor.selectLeft(); else this.cursor.selectLeft();
                case"Shift-Down":
                    if (this.cursor[p])for (; this.cursor[p];)this.cursor.selectRight(); else this.cursor.selectRight();
                case"Ctrl-Up":
                    break;
                case"Ctrl-Down":
                    break;
                case"Ctrl-Shift-Del":
                case"Ctrl-Del":
                    for (; this.cursor[p] || this.cursor.selection;)this.cursor.deleteForward();
                    break;
                case"Shift-Del":
                case"Del":
                    this.cursor.deleteForward();
                    break;
                case"Meta-A":
                case"Ctrl-A":
                    if (this !== this.cursor.root)return;
                    for (this.cursor.prepareMove().insAtRightEnd(this); this.cursor[u];)this.cursor.selectLeft();
                    break;
                default:
                    return !1
            }
            return e.preventDefault(), !1
        }, t.onText = function (t) {
            return this.cursor.write(t), !1
        }
    }), y = c(w, function (t, e) {
        t.init = function (t) {
            e.init.call(this, "$"), this.cursor = t
        }, t.htmlTemplate = '<span class="mathquill-rendered-math">&0</span>', t.createBlocks = function () {
            this.ends[u] = this.ends[p] = q(), this.blocks = [this.ends[u]], this.ends[u].parent = this, this.ends[u].cursor = this.cursor, this.ends[u].write = function (t, e, n) {
                "$" !== e ? j.prototype.write.call(this, t, e, n) : this.isEmpty() ? (t.insRightOf(this.parent).backspace().show(), Z("\\$", "$").createLeftOf(t)) : t[p] ? t[u] ? j.prototype.write.call(this, t, e, n) : t.insLeftOf(this.parent) : t.insRightOf(this.parent)
            }
        }, t.latex = function () {
            return "$" + this.ends[u].latex() + "$"
        }
    }), Q = c(j, function (t) {
        t.renderLatex = function (t) {
            var e, n, i, r, s, a, o, c, h, f, d, m = this, g = m.cursor;
            if (m.jQ.children().slice(1).remove(), m.ends[u] = m.ends[p] = 0, delete g.selection, g.show().insAtRightEnd(m), e = l.regex, n = l.string, i = l.eof, r = l.all, s = n("$").then(ie).skip(n("$").or(i)).map(function (t) {
                    var e, n = y(g);
                    return n.createBlocks(), e = n.ends[u], t.children().adopt(e, 0, 0), n
                }), a = n("\\$").result("$"), o = a.or(e(/^[^$]/)).map(Z), c = s.or(o).many(), h = c.skip(i).or(r.result(!1)).parse(t)) {
                for (f = 0; h.length > f; f += 1)h[f].adopt(m, m.ends[p], 0);
                d = m.join("html"), v.jQize(d).appendTo(m.jQ), this.finalizeInsert()
            }
        }, t.onKey = function (t) {
            "Spacebar" !== t && "Shift-Spacebar" !== t && q.prototype.onKey.apply(this, arguments)
        }, t.onText = q.prototype.onText, t.write = function (t, e, n) {
            if (n && n.remove(), "$" === e)y(t).createLeftOf(t); else {
                var i;
                "<" === e ? i = "&lt;" : ">" === e && (i = "&gt;"), Z(e, i).createLeftOf(t)
            }
        }
    }), C = {}, S = {}, O = t, E = document.createElement("div"), A = E.style, R = {
        transform: 1,
        WebkitTransform: 1,
        MozTransform: 1,
        OTransform: 1,
        msTransform: 1
    };
    for (T in R)if (T in A) {
        D = T;
        break
    }
    D ? L = function (t, e, n) {
        t.css(D, "scale(" + e + "," + n + ")")
    } : "filter"in A ? (O = function (t) {
        t.className = t.className
    }, L = function (t, e, n) {
        function i() {
            t.css("marginRight", (r.width() - 1) * (e - 1) / e + "px")
        }

        var r, s;
        e /= 1 + (n - 1) / 2, t.css("fontSize", n + "em"), t.hasClass("matrixed-container") || t.addClass("matrixed-container").wrapInner('<span class="matrixed"></span>'), r = t.children().css("filter", "progid:DXImageTransform.Microsoft.Matrix(M11=" + e + ",SizingMethod='auto expand')"), i(), s = setInterval(i), f(window).load(function () {
            clearTimeout(s), i()
        })
    }) : L = function (t, e, n) {
        t.css("fontSize", n + "em")
    }, z = c(w, function (t, e) {
        t.init = function (t, n, i) {
            e.init.call(this, t, "<" + n + " " + i + ">&0</" + n + ">")
        }
    }), S.mathrm = e(z, "\\mathrm", "span", 'class="roman font"'), S.mathit = e(z, "\\mathit", "i", 'class="font"'), S.mathbf = e(z, "\\mathbf", "b", 'class="font"'), S.mathsf = e(z, "\\mathsf", "span", 'class="sans-serif font"'), S.mathtt = e(z, "\\mathtt", "span", 'class="monospace font"'), S.underline = e(z, "\\underline", "span", 'class="non-leaf underline"'), S.overline = S.bar = e(z, "\\overline", "span", 'class="non-leaf overline"'), B = c(w, function (t, e) {
        t.init = function (t, n, i) {
            e.init.call(this, t, "<" + n + ' class="non-leaf">&0</' + n + ">", [i])
        }, t.finalizeTree = function () {
            function t(t) {
                var e = this.parent, n = t;
                do {
                    if (n[p])return t.insLeftOf(e), !1;
                    n = n.parent.parent
                } while (n !== e);
                return t.insRightOf(e), !1
            }

            n("SupSub is only _ and ^", "^" === this.ctrlSeq || "_" === this.ctrlSeq), "_" === this.ctrlSeq ? (this.down = this.ends[u], this.ends[u].up = t) : (this.up = this.ends[u], this.ends[u].down = t)
        }, t.latex = function () {
            var t = this.ends[u].latex();
            return 1 === t.length ? this.ctrlSeq + t : this.ctrlSeq + "{" + (t || " ") + "}"
        }, t.redraw = function () {
            this[u] && this[u].respace(), this[u]instanceof B || (this.respace(), !this[p] || this[p]instanceof B || this[p].respace())
        }, t.respace = function () {
            if ("\\int " === this[u].ctrlSeq || this[u]instanceof B && this[u].ctrlSeq != this.ctrlSeq && this[u][u] && "\\int " === this[u][u].ctrlSeq ? this.limit || (this.limit = !0, this.jQ.addClass("limit")) : this.limit && (this.limit = !1, this.jQ.removeClass("limit")), this.respaced = this[u]instanceof B && this[u].ctrlSeq != this.ctrlSeq && !this[u].respaced, this.respaced) {
                var t = +this.jQ.css("fontSize").slice(0, -2), e = this[u].jQ.outerWidth(), n = this.jQ.outerWidth();
                this.jQ.css({
                    left: (this.limit && "_" === this.ctrlSeq ? -.25 : 0) - e / t + "em",
                    marginRight: .1 - he(n, e) / t + "em"
                })
            } else this.limit && "_" === this.ctrlSeq ? this.jQ.css({
                left: "-.25em",
                marginRight: ""
            }) : this.jQ.css({left: "", marginRight: ""});
            return this[p]instanceof B && this[p].respace(), this
        }
    }), S.subscript = S._ = e(B, "_", "sub", "_"), S.superscript = S.supscript = S["^"] = e(B, "^", "sup", "**"), I = S.frac = S.dfrac = S.cfrac = S.fraction = c(w, function (t) {
        t.ctrlSeq = "\\frac", t.htmlTemplate = '<span class="fraction non-leaf"><span class="numerator">&0</span><span class="denominator">&1</span><span style="display:inline-block;width:0">&nbsp;</span></span>', t.textTemplate = ["(", "/", ")"], t.finalizeTree = function () {
            this.up = this.ends[p].up = this.ends[u], this.down = this.ends[u].down = this.ends[p]
        }
    }), $ = S.over = C["/"] = c(I, function (t, e) {
        t.createLeftOf = function (t) {
            if (!this.replacedFragment) {
                for (var n = t[u]; n && !(n instanceof V || n instanceof K || n instanceof ee || ",;:".split("").indexOf(n.ctrlSeq) > -1);)n = n[u];
                n instanceof ee && n[p]instanceof B && (n = n[p], n[p]instanceof B && n[p].ctrlSeq != n.ctrlSeq && (n = n[p])), n !== t[u] && (this.replaces(k(n[p] || t.parent.ends[u], t[u])), t[u] = n)
            }
            e.createLeftOf.call(this, t)
        }
    }), _ = S.sqrt = S["√"] = c(w, function (t, e) {
        t.ctrlSeq = "\\sqrt", t.htmlTemplate = '<span class="non-leaf"><span class="scaled sqrt-prefix">&radic;</span><span class="non-leaf sqrt-stem">&0</span></span>', t.textTemplate = ["sqrt(", ")"], t.parser = function () {
            return ie.optBlock.then(function (t) {
                return ie.block.map(function (e) {
                    var n = W();
                    return n.blocks = [t, e], t.adopt(n, 0, 0), e.adopt(n, t, 0), n
                })
            }).or(e.parser.call(this))
        }, t.redraw = function () {
            var t = this.ends[p].jQ;
            L(t.prev(), 1, t.innerHeight() / +t.css("fontSize").slice(0, -2) - .1)
        }
    }), S.vec = c(w, function (t) {
        t.ctrlSeq = "\\vec", t.htmlTemplate = '<span class="non-leaf"><span class="vector-prefix">&rarr;</span><span class="vector-stem">&0</span></span>', t.textTemplate = ["vec(", ")"]
    }), W = S.nthroot = c(_, function (t) {
        t.htmlTemplate = '<sup class="nthroot non-leaf">&0</sup><span class="scaled"><span class="sqrt-prefix scaled">&radic;</span><span class="sqrt-stem non-leaf">&1</span></span>', t.textTemplate = ["sqrt[", "](", ")"], t.latex = function () {
            return "\\sqrt[" + this.ends[u].latex() + "]{" + this.ends[p].latex() + "}"
        }
    }), M = c(w, function (t, e) {
        t.init = function (t, n, i, r) {
            e.init.call(this, "\\left" + i, '<span class="non-leaf"><span class="scaled paren">' + t + "</span>" + '<span class="non-leaf">&0</span>' + '<span class="scaled paren">' + n + "</span>" + "</span>", [t, n]), this.end = "\\right" + r
        }, t.jQadd = function () {
            e.jQadd.apply(this, arguments);
            var t = this.jQ;
            this.bracketjQs = t.children(":first").add(t.children(":last"))
        }, t.latex = function () {
            return this.ctrlSeq + this.ends[u].latex() + this.end
        }, t.redraw = function () {
            var t = this.ends[u].jQ, e = t.outerHeight() / +t.css("fontSize").slice(0, -2);
            L(this.bracketjQs, he(1 + .2 * (e - 1), 1.2), 1.05 * e)
        }
    }), S.left = c(w, function (t) {
        t.parser = function () {
            var t = l.regex, e = l.string, n = l.succeed, i = l.optWhitespace;
            return i.then(t(/^(?:[([|]|\\\{)/)).then(function (r) {
                "\\" === r.charAt(0) && (r = r.slice(1));
                var s = C[r]();
                return ie.map(function (t) {
                    s.blocks = [t], t.adopt(s, 0, 0)
                }).then(e("\\right")).skip(i).then(t(/^(?:[\])|]|\\\})/)).then(function (t) {
                    return t.slice(-1) !== s.end.slice(-1) ? l.fail("open doesn't match close") : n(s)
                })
            })
        }
    }), S.right = c(w, function (t) {
        t.parser = function () {
            return l.fail("unmatched \\right")
        }
    }), S.lbrace = C["{"] = e(M, "{", "}", "\\{", "\\}"), S.langle = S.lang = e(M, "&lang;", "&rang;", "\\langle ", "\\rangle "), F = c(M, function (t, e) {
        t.createLeftOf = function (t) {
            t[p] || !t.parent.parent || t.parent.parent.end !== this.end || this.replacedFragment ? e.createLeftOf.call(this, t) : t.insRightOf(t.parent.parent)
        }, t.placeCursor = function (t) {
            this.ends[u].blur(), t.insRightOf(this)
        }
    }), S.rbrace = C["}"] = e(F, "{", "}", "\\{", "\\}"), S.rangle = S.rang = e(F, "&lang;", "&rang;", "\\langle ", "\\rangle "), P = function (t, e) {
        t.init = function (t, n) {
            e.init.call(this, t, n, t, n)
        }
    }, U = c(M, P), S.lparen = C["("] = e(U, "(", ")"), S.lbrack = S.lbracket = C["["] = e(U, "[", "]"), H = c(F, P), S.rparen = C[")"] = e(H, "(", ")"), S.rbrack = S.rbracket = C["]"] = e(H, "[", "]"), S.lpipe = S.rpipe = C["|"] = c(U, function (t, e) {
        t.init = function () {
            e.init.call(this, "|", "|")
        }, t.createLeftOf = F.prototype.createLeftOf
    }), K = C.$ = S.text = S.textnormal = S.textrm = S.textup = S.textmd = c(w, function (t, e) {
        t.ctrlSeq = "\\text", t.htmlTemplate = '<span class="text">&0</span>', t.replaces = function (t) {
            t instanceof k ? this.replacedText = t.remove().jQ.text() : "string" == typeof t && (this.replacedText = t)
        }, t.textTemplate = ['"', '"'], t.parser = function () {
            var t = this, e = l.string, n = l.regex, i = l.optWhitespace;
            return i.then(e("{")).then(n(/^[^}]*/)).skip(e("}")).map(function (e) {
                var n, i, r;
                for (t.createBlocks(), n = t.ends[u], i = 0; e.length > i; i += 1)r = Z(e.charAt(i)), r.adopt(n, n.ends[p], 0);
                return t
            })
        }, t.createBlocks = function () {
            this.ends[u] = this.ends[p] = N(), this.blocks = [this.ends[u]], this.ends[u].parent = this
        }, t.finalizeInsert = function () {
            this.ends[u].blur = function () {
                return delete this.blur, this
            }, e.finalizeInsert.call(this)
        }, t.createLeftOf = function (t) {
            if (e.createLeftOf.call(this, this.cursor = t), this.replacedText)for (var n = 0; this.replacedText.length > n; n += 1)this.ends[u].write(t, this.replacedText.charAt(n))
        }
    }), N = c(j, function (t, e) {
        t.onKey = function (t) {
            return "Spacebar" === t || "Shift-Spacebar" === t ? !1 : a
        }, t.deleteOutOf = function (t, e) {
            this.isEmpty() && e.insRightOf(this.parent)
        }, t.write = function (t, e, n) {
            var i, r;
            return n && n.remove(), "$" !== e ? ("<" === e ? i = "&lt;" : ">" === e && (i = "&gt;"), Z(e, i).createLeftOf(t)) : this.isEmpty() ? (t.insRightOf(this.parent).backspace(), Z("\\$", "$").createLeftOf(t)) : t[p] ? t[u] ? (r = K(), r.replaces(k(t[p], this.ends[p])), t.insRightOf(this.parent), r.adopt = function () {
                delete this.adopt, this.adopt.apply(this, arguments), this[u] = 0
            }, r.createLeftOf(t), r[u] = this.parent, t.insLeftOf(r)) : t.insLeftOf(this.parent) : t.insRightOf(this.parent), !1
        }, t.blur = function () {
            if (this.jQ.removeClass("hasCursor"), this.isEmpty()) {
                var t = this.parent, e = t.cursor;
                e.parent === this ? this.jQ.addClass("empty") : (e.hide(), t.remove(), e[p] === t ? e[p] = t[p] : e[u] === t && (e[u] = t[u]), e.show().parent.bubble("redraw"))
            }
            return this
        }, t.focus = function () {
            var t, n, i, r;
            return e.focus.call(this), t = this.parent, t[p].ctrlSeq === t.ctrlSeq ? (n = this, i = t.cursor, r = t[p].ends[u], r.eachChild(function (t) {
                t.parent = n, t.jQ.appendTo(n.jQ)
            }), this.ends[p] ? this.ends[p][p] = r.ends[u] : this.ends[u] = r.ends[u], r.ends[u][u] = this.ends[p], this.ends[p] = r.ends[p], r.parent.remove(), i[u] ? i.insRightOf(i[u]) : i.insAtLeftEnd(this), i.parent.bubble("redraw")) : t[u].ctrlSeq === t.ctrlSeq && (i = t.cursor, i[u] ? t[u].ends[u].focus() : i.insAtRightEnd(t[u].ends[u])), this
        }
    }), S.em = S.italic = S.italics = S.emph = S.textit = S.textsl = s("\\textit", "i", 'class="text"'), S.strong = S.bold = S.textbf = s("\\textbf", "b", 'class="text"'), S.sf = S.textsf = s("\\textsf", "span", 'class="sans-serif text"'), S.tt = S.texttt = s("\\texttt", "span", 'class="monospace text"'), S.textsc = s("\\textsc", "span", 'style="font-variant:small-caps" class="text"'), S.uppercase = s("\\uppercase", "span", 'style="text-transform:uppercase" class="text"'), S.lowercase = s("\\lowercase", "span", 'style="text-transform:lowercase" class="text"'), C["\\"] = c(w, function (t, e) {
        t.ctrlSeq = "\\", t.replaces = function (t) {
            this._replacedFragment = t.disown(), this.isEmpty = function () {
                return !1
            }
        }, t.htmlTemplate = '<span class="latex-command-input non-leaf">\\<span>&0</span></span>', t.textTemplate = ["\\"], t.createBlocks = function () {
            e.createBlocks.call(this), this.ends[u].focus = function () {
                return this.parent.jQ.addClass("hasCursor"), this.isEmpty() && this.parent.jQ.removeClass("empty"), this
            }, this.ends[u].blur = function () {
                return this.parent.jQ.removeClass("hasCursor"), this.isEmpty() && this.parent.jQ.addClass("empty"), this
            }
        }, t.createLeftOf = function (t) {
            if (e.createLeftOf.call(this, t), this.cursor = t.insAtRightEnd(this.ends[u]), this._replacedFragment) {
                var n = this.jQ[0];
                this.jQ = this._replacedFragment.jQ.addClass("blur").bind("mousedown mousemove", function (t) {
                    return f(t.target = n).trigger(t), !1
                }).insertBefore(this.jQ).add(this.jQ)
            }
            this.ends[u].write = function (t, e, n) {
                n && n.remove(), e.match(/[a-z]/i) ? Z(e).createLeftOf(t) : (this.parent.renderCommand(), "\\" === e && this.isEmpty() || this.parent.parent.write(t, e))
            }
        }, t.latex = function () {
            return "\\" + this.ends[u].latex() + " "
        }, t.onKey = function (t, e) {
            return "Tab" === t || "Enter" === t || "Spacebar" === t ? (this.renderCommand(), e.preventDefault(), !1) : a
        }, t.renderCommand = function () {
            this.jQ = this.jQ.last(), this.remove(), this[p] ? this.cursor.insLeftOf(this[p]) : this.cursor.insAtRightEnd(this.parent);
            var t = this.ends[u].latex();
            t || (t = "backslash"), this.cursor.insertCmd(t, this._replacedFragment)
        }
    }), G = S.binom = S.binomial = c(w, function (t) {
        t.ctrlSeq = "\\binom", t.htmlTemplate = '<span class="paren scaled">(</span><span class="non-leaf"><span class="array non-leaf"><span>&0</span><span>&1</span></span></span><span class="paren scaled">)</span>', t.textTemplate = ["choose(", ",", ")"], t.redraw = function () {
            var t = this.jQ.eq(1), e = t.outerHeight() / +t.css("fontSize").slice(0, -2), n = this.jQ.filter(".paren");
            L(n, he(1 + .2 * (e - 1), 1.2), 1.05 * e)
        }
    }), S.choose = c(G, function (t) {
        t.createLeftOf = $.prototype.createLeftOf
    }), S.vector = c(w, function (t, e) {
        t.ctrlSeq = "\\vector", t.htmlTemplate = '<span class="array"><span>&0</span></span>', t.latex = function () {
            return "\\begin{matrix}" + this.foldChildren([], function (t, e) {
                    return t.push(e.latex()), t
                }).join("\\\\") + "\\end{matrix}"
        }, t.text = function () {
            return "[" + this.foldChildren([], function (t, e) {
                    return t.push(e.text()), t
                }).join() + "]"
        }, t.createLeftOf = function (t) {
            e.createLeftOf.call(this, this.cursor = t)
        }, t.onKey = function (t, e) {
            var n, i = this.cursor.parent;
            if (i.parent === this) {
                if ("Enter" === t)return n = j(), n.parent = this, n.jQ = f("<span></span>").attr(ce, n.id).insertAfter(i.jQ), i[p] ? i[p][u] = n : this.ends[p] = n, n[p] = i[p], i[p] = n, n[u] = i, this.bubble("redraw").cursor.insAtRightEnd(n), e.preventDefault(), !1;
                if ("Tab" === t && !i[p])return i.isEmpty() ? i[u] ? (this.cursor.insRightOf(this), delete i[u][p], this.ends[p] = i[u], i.jQ.remove(), this.bubble("redraw"), e.preventDefault(), !1) : a : (n = j(), n.parent = this, n.jQ = f("<span></span>").attr(ce, n.id).appendTo(this.jQ), this.ends[p] = n, i[p] = n, n[u] = i, this.bubble("redraw").cursor.insAtRightEnd(n), e.preventDefault(), !1);
                if (8 === e.which) {
                    if (i.isEmpty())return i[u] ? (this.cursor.insAtRightEnd(i[u]), i[u][p] = i[p]) : (this.cursor.insLeftOf(this), this.ends[u] = i[p]), i[p] ? i[p][u] = i[u] : this.ends[p] = i[u], i.jQ.remove(), this.isEmpty() ? this.cursor.deleteForward() : this.bubble("redraw"), e.preventDefault(), !1;
                    if (!this.cursor[u])return e.preventDefault(), !1
                }
            }
        }
    }), S.editable = c(y, function (t, e) {
        t.init = function () {
            w.prototype.init.call(this, "\\editable")
        }, t.jQadd = function () {
            var t, n, i = this;
            e.jQadd.apply(i, arguments), t = i.ends[u].disown(), n = i.jQ.children().detach(), i.ends[u] = i.ends[p] = q(), i.blocks = [i.ends[u]], i.ends[u].parent = i, r(i.jQ, i.ends[u], !1, !0), i.cursor = i.ends[u].cursor, t.children().adopt(i.ends[u], 0, 0), n.appendTo(i.ends[u].jQ), i.ends[u].cursor.insAtRightEnd(i.ends[u])
        }, t.latex = function () {
            return this.ends[u].latex()
        }, t.text = function () {
            return this.ends[u].text()
        }
    }), S.f = e(x, "f", '<var class="florin">&fnof;</var><span style="display:inline-block;width:0">&nbsp;</span>'), X = c(x, function (t, e) {
        t.init = function (t, n) {
            e.init.call(this, t, "<var>" + (n || t) + "</var>")
        }, t.text = function () {
            var t = this.ctrlSeq;
            return !this[u] || this[u]instanceof X || this[u]instanceof V || (t = "*" + t), !this[p] || this[p]instanceof V || "^" === this[p].ctrlSeq || (t += "*"), t
        }
    }), Z = c(x, function (t, e) {
        t.init = function (t, n) {
            e.init.call(this, t, "<span>" + (n || t) + "</span>")
        }
    }), C[" "] = e(Z, "\\:", " "), S.prime = C["'"] = e(Z, "'", "&prime;"), Y = c(x, function (t, e) {
        t.init = function (t, n) {
            e.init.call(this, t, '<span class="nonSymbola">' + (n || t) + "</span>")
        }
    }), S["@"] = Y, S["&"] = e(Y, "\\&", "&amp;"), S["%"] = e(Y, "\\%", "%"), S.alpha = S.beta = S.gamma = S.delta = S.zeta = S.eta = S.theta = S.iota = S.kappa = S.mu = S.nu = S.xi = S.rho = S.sigma = S.tau = S.chi = S.psi = S.omega = c(X, function (t, e) {
        t.init = function (t) {
            e.init.call(this, "\\" + t + " ", "&" + t + ";")
        }
    }), S.phi = e(X, "\\phi ", "&#981;"), S.phiv = S.varphi = e(X, "\\varphi ", "&phi;"), S.epsilon = e(X, "\\epsilon ", "&#1013;"), S.epsiv = S.varepsilon = e(X, "\\varepsilon ", "&epsilon;"), S.piv = S.varpi = e(X, "\\varpi ", "&piv;"), S.sigmaf = S.sigmav = S.varsigma = e(X, "\\varsigma ", "&sigmaf;"), S.thetav = S.vartheta = S.thetasym = e(X, "\\vartheta ", "&thetasym;"), S.upsilon = S.upsi = e(X, "\\upsilon ", "&upsilon;"), S.gammad = S.Gammad = S.digamma = e(X, "\\digamma ", "&#989;"), S.kappav = S.varkappa = e(X, "\\varkappa ", "&#1008;"), S.rhov = S.varrho = e(X, "\\varrho ", "&#1009;"), S.pi = S["π"] = e(Y, "\\pi ", "&pi;"), S.lambda = e(Y, "\\lambda ", "&lambda;"), S.Upsilon = S.Upsi = S.upsih = S.Upsih = e(x, "\\Upsilon ", '<var style="font-family: serif">&upsih;</var>'), S.Gamma = S.Delta = S.Theta = S.Lambda = S.Xi = S.Pi = S.Sigma = S.Phi = S.Psi = S.Omega = S.forall = c(Z, function (t, e) {
        t.init = function (t) {
            e.init.call(this, "\\" + t + " ", "&" + t + ";")
        }
    }), J = c(w, function (t) {
        t.init = function (t) {
            this.latex = t
        }, t.createLeftOf = function (t) {
            t.writeLatex(this.latex)
        }, t.parser = function () {
            var t = ie.parse(this.latex).children();
            return l.succeed(t)
        }
    }), S["¹"] = e(J, "^1"), S["²"] = e(J, "^2"), S["³"] = e(J, "^3"), S["¼"] = e(J, "\\frac14"), S["½"] = e(J, "\\frac12"), S["¾"] = e(J, "\\frac34"), V = c(x, function (t, e) {
        t.init = function (t, n, i) {
            e.init.call(this, t, '<span class="binary-operator">' + n + "</span>", i)
        }
    }), te = c(V, function (t) {
        t.init = Z.prototype.init, t.respace = function () {
            return this.jQ[0].className = this[u] ? this[u]instanceof V && this[p] && !(this[p]instanceof V) ? "unary-operator" : "binary-operator" : "", this
        }
    }), S["+"] = e(te, "+", "+"), S["–"] = S["-"] = e(te, "-", "&minus;"), S["±"] = S.pm = S.plusmn = S.plusminus = e(te, "\\pm ", "&plusmn;"), S.mp = S.mnplus = S.minusplus = e(te, "\\mp ", "&#8723;"), C["*"] = S.sdot = S.cdot = e(V, "\\cdot ", "&middot;"), S["="] = e(V, "=", "="), S["<"] = e(V, "<", "&lt;"), S[">"] = e(V, ">", "&gt;"), S.notin = S.sim = S.cong = S.equiv = S.oplus = S.otimes = c(V, function (t, e) {
        t.init = function (t) {
            e.init.call(this, "\\" + t + " ", "&" + t + ";")
        }
    }), S.times = e(V, "\\times ", "&times;", "[x]"), S["÷"] = S.div = S.divide = S.divides = e(V, "\\div ", "&divide;", "[/]"), S["≠"] = S.ne = S.neq = e(V, "\\ne ", "&ne;"), S.ast = S.star = S.loast = S.lowast = e(V, "\\ast ", "&lowast;"), S.therefor = S.therefore = e(V, "\\therefore ", "&there4;"), S.cuz = S.because = e(V, "\\because ", "&#8757;"), S.prop = S.propto = e(V, "\\propto ", "&prop;"), S["≈"] = S.asymp = S.approx = e(V, "\\approx ", "&asymp;"), S.lt = e(V, "<", "&lt;"), S.gt = e(V, ">", "&gt;"), S["≤"] = S.le = S.leq = e(V, "\\le ", "&le;"),S["≥"] = S.ge = S.geq = e(V, "\\ge ", "&ge;"),S.isin = S["in"] = e(V, "\\in ", "&isin;"),S.ni = S.contains = e(V, "\\ni ", "&ni;"),S.notni = S.niton = S.notcontains = S.doesnotcontain = e(V, "\\not\\ni ", "&#8716;"),S.sub = S.subset = e(V, "\\subset ", "&sub;"),S.sup = S.supset = S.superset = e(V, "\\supset ", "&sup;"),S.nsub = S.notsub = S.nsubset = S.notsubset = e(V, "\\not\\subset ", "&#8836;"),S.nsup = S.notsup = S.nsupset = S.notsupset = S.nsuperset = S.notsuperset = e(V, "\\not\\supset ", "&#8837;"),S.sube = S.subeq = S.subsete = S.subseteq = e(V, "\\subseteq ", "&sube;"),S.supe = S.supeq = S.supsete = S.supseteq = S.supersete = S.superseteq = e(V, "\\supseteq ", "&supe;"),S.nsube = S.nsubeq = S.notsube = S.notsubeq = S.nsubsete = S.nsubseteq = S.notsubsete = S.notsubseteq = e(V, "\\not\\subseteq ", "&#8840;"),S.nsupe = S.nsupeq = S.notsupe = S.notsupeq = S.nsupsete = S.nsupseteq = S.notsupsete = S.notsupseteq = S.nsupersete = S.nsuperseteq = S.notsupersete = S.notsuperseteq = e(V, "\\not\\supseteq ", "&#8841;"),ee = c(x, function (t, e) {
        t.init = function (t, n) {
            e.init.call(this, t, "<big>" + n + "</big>")
        }
    }),S["∑"] = S.sum = S.summation = e(ee, "\\sum ", "&sum;"),S["∏"] = S.prod = S.product = e(ee, "\\prod ", "&prod;"),S.coprod = S.coproduct = e(ee, "\\coprod ", "&#8720;"),S["∫"] = S["int"] = S.integral = e(ee, "\\int ", "&int;"),S.N = S.naturals = S.Naturals = e(Z, "\\mathbb{N}", "&#8469;"),S.P = S.primes = S.Primes = S.projective = S.Projective = S.probability = S.Probability = e(Z, "\\mathbb{P}", "&#8473;"),S.Z = S.integers = S.Integers = e(Z, "\\mathbb{Z}", "&#8484;"),S.Q = S.rationals = S.Rationals = e(Z, "\\mathbb{Q}", "&#8474;"),S.R = S.reals = S.Reals = e(Z, "\\mathbb{R}", "&#8477;"),S.C = S.complex = S.Complex = S.complexes = S.Complexes = S.complexplane = S.Complexplane = S.ComplexPlane = e(Z, "\\mathbb{C}", "&#8450;"),S.H = S.Hamiltonian = S.quaternions = S.Quaternions = e(Z, "\\mathbb{H}", "&#8461;"),S.quad = S.emsp = e(Z, "\\quad ", "    "),S.qquad = e(Z, "\\qquad ", "        "),S.diamond = e(Z, "\\diamond ", "&#9671;"),S.bigtriangleup = e(Z, "\\bigtriangleup ", "&#9651;"),S.ominus = e(Z, "\\ominus ", "&#8854;"),S.uplus = e(Z, "\\uplus ", "&#8846;"),S.bigtriangledown = e(Z, "\\bigtriangledown ", "&#9661;"),S.sqcap = e(Z, "\\sqcap ", "&#8851;"),S.triangleleft = e(Z, "\\triangleleft ", "&#8882;"),S.sqcup = e(Z, "\\sqcup ", "&#8852;"),S.triangleright = e(Z, "\\triangleright ", "&#8883;"),S.odot = e(Z, "\\odot ", "&#8857;"),S.bigcirc = e(Z, "\\bigcirc ", "&#9711;"),S.dagger = e(Z, "\\dagger ", "&#0134;"),S.ddagger = e(Z, "\\ddagger ", "&#135;"),S.wr = e(Z, "\\wr ", "&#8768;"),S.amalg = e(Z, "\\amalg ", "&#8720;"),S.models = e(Z, "\\models ", "&#8872;"),S.prec = e(Z, "\\prec ", "&#8826;"),S.succ = e(Z, "\\succ ", "&#8827;"),S.preceq = e(Z, "\\preceq ", "&#8828;"),S.succeq = e(Z, "\\succeq ", "&#8829;"),S.simeq = e(Z, "\\simeq ", "&#8771;"),S.mid = e(Z, "\\mid ", "&#8739;"),S.ll = e(Z, "\\ll ", "&#8810;"),S.gg = e(Z, "\\gg ", "&#8811;"),S.parallel = e(Z, "\\parallel ", "&#8741;"),S.bowtie = e(Z, "\\bowtie ", "&#8904;"),S.sqsubset = e(Z, "\\sqsubset ", "&#8847;"),S.sqsupset = e(Z, "\\sqsupset ", "&#8848;"),S.smile = e(Z, "\\smile ", "&#8995;"),S.sqsubseteq = e(Z, "\\sqsubseteq ", "&#8849;"),S.sqsupseteq = e(Z, "\\sqsupseteq ", "&#8850;"),S.doteq = e(Z, "\\doteq ", "&#8784;"),S.frown = e(Z, "\\frown ", "&#8994;"),S.vdash = e(Z, "\\vdash ", "&#8870;"),S.dashv = e(Z, "\\dashv ", "&#8867;"),S.longleftarrow = e(Z, "\\longleftarrow ", "&#8592;"),S.longrightarrow = e(Z, "\\longrightarrow ", "&#8594;"),S.Longleftarrow = e(Z, "\\Longleftarrow ", "&#8656;"),S.Longrightarrow = e(Z, "\\Longrightarrow ", "&#8658;"),S.longleftrightarrow = e(Z, "\\longleftrightarrow ", "&#8596;"),S.updownarrow = e(Z, "\\updownarrow ", "&#8597;"),S.Longleftrightarrow = e(Z, "\\Longleftrightarrow ", "&#8660;"),S.Updownarrow = e(Z, "\\Updownarrow ", "&#8661;"),S.mapsto = e(Z, "\\mapsto ", "&#8614;"),S.nearrow = e(Z, "\\nearrow ", "&#8599;"),S.hookleftarrow = e(Z, "\\hookleftarrow ", "&#8617;"),S.hookrightarrow = e(Z, "\\hookrightarrow ", "&#8618;"),S.searrow = e(Z, "\\searrow ", "&#8600;"),S.leftharpoonup = e(Z, "\\leftharpoonup ", "&#8636;"),S.rightharpoonup = e(Z, "\\rightharpoonup ", "&#8640;"),S.swarrow = e(Z, "\\swarrow ", "&#8601;"),S.leftharpoondown = e(Z, "\\leftharpoondown ", "&#8637;"),S.rightharpoondown = e(Z, "\\rightharpoondown ", "&#8641;"),S.nwarrow = e(Z, "\\nwarrow ", "&#8598;"),S.ldots = e(Z, "\\ldots ", "&#8230;"),S.cdots = e(Z, "\\cdots ", "&#8943;"),S.vdots = e(Z, "\\vdots ", "&#8942;"),S.ddots = e(Z, "\\ddots ", "&#8944;"),S.surd = e(Z, "\\surd ", "&#8730;"),S.triangle = e(Z, "\\triangle ", "&#9653;"),S.ell = e(Z, "\\ell ", "&#8467;"),S.top = e(Z, "\\top ", "&#8868;"),S.flat = e(Z, "\\flat ", "&#9837;"),S.natural = e(Z, "\\natural ", "&#9838;"),S.sharp = e(Z, "\\sharp ", "&#9839;"),S.wp = e(Z, "\\wp ", "&#8472;"),S.bot = e(Z, "\\bot ", "&#8869;"),S.clubsuit = e(Z, "\\clubsuit ", "&#9827;"),S.diamondsuit = e(Z, "\\diamondsuit ", "&#9826;"),S.heartsuit = e(Z, "\\heartsuit ", "&#9825;"),S.spadesuit = e(Z, "\\spadesuit ", "&#9824;"),S.oint = e(Z, "\\oint ", "&#8750;"),S.bigcap = e(Z, "\\bigcap ", "&#8745;"),S.bigcup = e(Z, "\\bigcup ", "&#8746;"),S.bigsqcup = e(Z, "\\bigsqcup ", "&#8852;"),S.bigvee = e(Z, "\\bigvee ", "&#8744;"),S.bigwedge = e(Z, "\\bigwedge ", "&#8743;"),S.bigodot = e(Z, "\\bigodot ", "&#8857;"),S.bigotimes = e(Z, "\\bigotimes ", "&#8855;"),S.bigoplus = e(Z, "\\bigoplus ", "&#8853;"),S.biguplus = e(Z, "\\biguplus ", "&#8846;"),S.lfloor = e(Z, "\\lfloor ", "&#8970;"),S.rfloor = e(Z, "\\rfloor ", "&#8971;"),S.lceil = e(Z, "\\lceil ", "&#8968;"),S.rceil = e(Z, "\\rceil ", "&#8969;"),S.slash = e(Z, "\\slash ", "&#47;"),S.opencurlybrace = e(Z, "\\opencurlybrace ", "&#123;"),S.closecurlybrace = e(Z, "\\closecurlybrace ", "&#125;"),S.caret = e(Z, "\\caret ", "^"),S.underscore = e(Z, "\\underscore ", "_"),S.backslash = e(Z, "\\backslash ", "\\"),S.vert = e(Z, "|"),S.perp = S.perpendicular = e(Z, "\\perp ", "&perp;"),S.nabla = S.del = e(Z, "\\nabla ", "&nabla;"),S.hbar = e(Z, "\\hbar ", "&#8463;"),S.AA = S.Angstrom = S.angstrom = e(Z, "\\text\\AA ", "&#8491;"),S.ring = S.circ = S.circle = e(Z, "\\circ ", "&#8728;"),S.bull = S.bullet = e(Z, "\\bullet ", "&bull;"),S.setminus = S.smallsetminus = e(Z, "\\setminus ", "&#8726;"),S.not = S["¬"] = S.neg = e(Z, "\\neg ", "&not;"),S["…"] = S.dots = S.ellip = S.hellip = S.ellipsis = S.hellipsis = e(Z, "\\dots ", "&hellip;"),S.converges = S.darr = S.dnarr = S.dnarrow = S.downarrow = e(Z, "\\downarrow ", "&darr;"),S.dArr = S.dnArr = S.dnArrow = S.Downarrow = e(Z, "\\Downarrow ", "&dArr;"),S.diverges = S.uarr = S.uparrow = e(Z, "\\uparrow ", "&uarr;"),S.uArr = S.Uparrow = e(Z, "\\Uparrow ", "&uArr;"),S.to = e(V, "\\to ", "&rarr;"),S.rarr = S.rightarrow = e(Z, "\\rightarrow ", "&rarr;"),S.implies = e(V, "\\Rightarrow ", "&rArr;"),S.rArr = S.Rightarrow = e(Z, "\\Rightarrow ", "&rArr;"),S.gets = e(V, "\\gets ", "&larr;"),S.larr = S.leftarrow = e(Z, "\\leftarrow ", "&larr;"),S.impliedby = e(V, "\\Leftarrow ", "&lArr;"),S.lArr = S.Leftarrow = e(Z, "\\Leftarrow ", "&lArr;"),S.harr = S.lrarr = S.leftrightarrow = e(Z, "\\leftrightarrow ", "&harr;"),S.iff = e(V, "\\Leftrightarrow ", "&hArr;"),S.hArr = S.lrArr = S.Leftrightarrow = e(Z, "\\Leftrightarrow ", "&hArr;"),S.Re = S.Real = S.real = e(Z, "\\Re ", "&real;"),S.Im = S.imag = S.image = S.imagin = S.imaginary = S.Imaginary = e(Z, "\\Im ", "&image;"),S.part = S.partial = e(Z, "\\partial ", "&part;"),S.inf = S.infin = S.infty = S.infinity = e(Z, "\\infty ", "&infin;"),S.alef = S.alefsym = S.aleph = S.alephsym = e(Z, "\\aleph ", "&alefsym;"),S.xist = S.xists = S.exist = S.exists = e(Z, "\\exists ", "&exist;"),S.and = S.land = S.wedge = e(Z, "\\wedge ", "&and;"),S.or = S.lor = S.vee = e(Z, "\\vee ", "&or;"),S.o = S.O = S.empty = S.emptyset = S.oslash = S.Oslash = S.nothing = S.varnothing = e(V, "\\varnothing ", "&empty;"),S.cup = S.union = e(V, "\\cup ", "&cup;"),S.cap = S.intersect = S.intersection = e(V, "\\cap ", "&cap;"),S.deg = S.degree = e(Z, "^\\circ ", "&deg;"),S.ang = S.angle = e(Z, "\\angle ", "&ang;"),ne = c(x, function (t, e) {
        t.init = function (t) {
            e.init.call(this, "\\" + t + " ", "<span>" + t + "</span>")
        }, t.respace = function () {
            this.jQ[0].className = this[p]instanceof B || this[p]instanceof M ? "" : "non-italicized-function"
        }
    }),S.ln = S.lg = S.log = S.span = S.proj = S.det = S.dim = S.min = S.max = S.mod = S.lcm = S.gcd = S.gcf = S.hcf = S.lim = ne,function () {
        var t, e = ["sin", "cos", "tan", "sec", "cosec", "csc", "cotan", "cot"];
        for (t in e)S[e[t]] = S[e[t] + "h"] = S["a" + e[t]] = S["arc" + e[t]] = S["a" + e[t] + "h"] = S["arc" + e[t] + "h"] = ne
    }(),ie = function () {
        function t(t) {
            var e = j();
            return t.adopt(e, 0, 0), e
        }

        function e(t) {
            var e, n = t[0] || j();
            for (e = 1; t.length > e; e += 1)t[e].children().adopt(n, n.ends[p], 0);
            return n
        }

        var n = l.string, i = l.regex, r = l.letter, s = l.any, a = l.optWhitespace, o = l.succeed, c = l.fail, h = r.map(X), u = i(/^[^${}\\_^]/).map(Z), f = i(/^[^\\a-eg-zA-Z]/).or(n("\\").then(i(/^[a-z]+/i).or(i(/^\s+/).result(" ")).or(s))).then(function (t) {
            var e = S[t];
            return e ? e(t).parser() : c("unknown command: \\" + t)
        }), d = f.or(h).or(u), m = n("{").then(function () {
            return b
        }).skip(n("}")), g = a.then(m.or(d.map(t))), b = g.many().map(e).skip(a), v = n("[").then(g.then(function (t) {
            return "]" !== t.join("latex") ? o(t) : c()
        }).many().map(e).skip(a)).skip(n("]")), w = b;
        return w.block = g, w.optBlock = v, w
    }(),re = c(d, function (t) {
        function e(t, e) {
            var i, r, s, a;
            if (t[p][e])t.insAtLeftEnd(t[p][e]); else if (t[u][e])t.insAtRightEnd(t[u][e]); else {
                i = t.parent;
                do {
                    if (r = i[e], r && ("function" == typeof r && (r = i[e](t)), r === !1 || r instanceof j)) {
                        t.upDownCache[i.id] = d(t.parent, t[u], t[p]), r instanceof j && (s = t.upDownCache[r.id], s ? s[p] ? t.insLeftOf(s[p]) : t.insAtRightEnd(s.parent) : (a = n(t).left, t.insAtRightEnd(r), t.seekHoriz(a, r)));
                        break
                    }
                    i = i.parent.parent
                } while (i)
            }
            return t.clearSelection().show()
        }

        function n(t) {
            var e = t.jQ.removeClass("cursor").offset();
            return t.jQ.addClass("cursor"), e
        }

        function r(t) {
            t.upDownCache = {}
        }

        t.init = function (t) {
            this.parent = this.root = t;
            var e = this.jQ = this._jQ = f('<span class="cursor">&zwj;</span>');
            this.blink = function () {
                e.toggleClass("blink")
            }, this.upDownCache = {}
        }, t.show = function () {
            return this.jQ = this._jQ.removeClass("blink"), "intervalId"in this ? clearInterval(this.intervalId) : (this[p] ? this.selection && this.selection.ends[u][u] === this[u] ? this.jQ.insertBefore(this.selection.jQ) : this.jQ.insertBefore(this[p].jQ.first()) : this.jQ.appendTo(this.parent.jQ), this.parent.focus()), this.intervalId = setInterval(this.blink, 500), this
        }, t.hide = function () {
            return "intervalId"in this && clearInterval(this.intervalId), delete this.intervalId, this.jQ.detach(), this.jQ = f(), this
        }, t.withDirInsertAt = function (t, e, n, i) {
            var r = this.parent;
            this.parent = e, this[t] = n, this[-t] = i, r.blur()
        }, t.insDirOf = function (t, e) {
            return i(t), this.withDirInsertAt(t, e.parent, e[t], e), this.parent.jQ.addClass("hasCursor"), this.jQ.insDirOf(t, e.jQ), this
        }, t.insLeftOf = function (t) {
            return this.insDirOf(u, t)
        }, t.insRightOf = function (t) {
            return this.insDirOf(p, t)
        }, t.insAtDirEnd = function (t, e) {
            return i(t), this.withDirInsertAt(t, e, 0, e.ends[t]), t === u && e.textarea ? this.jQ.insDirOf(-t, e.textarea) : this.jQ.insAtDirEnd(t, e.jQ), e.focus(), this
        }, t.insAtLeftEnd = function (t) {
            return this.insAtDirEnd(u, t)
        }, t.insAtRightEnd = function (t) {
            return this.insAtDirEnd(p, t)
        }, t.hopDir = function (t) {
            return i(t), this.jQ.insDirOf(t, this[t].jQ), this[-t] = this[t], this[t] = this[t][t], this
        }, t.hopLeft = function () {
            return this.hopDir(u)
        }, t.hopRight = function () {
            return this.hopDir(p)
        }, t.moveDirWithin = function (t, e) {
            if (i(t), this[t])this[t].ends[-t] ? this.insAtDirEnd(-t, this[t].ends[-t]) : this.hopDir(t); else {
                if (this.parent === e)return;
                this.parent[t] ? this.insAtDirEnd(-t, this.parent[t]) : this.insDirOf(t, this.parent.parent)
            }
        }, t.moveLeftWithin = function (t) {
            return this.moveDirWithin(u, t)
        }, t.moveRightWithin = function (t) {
            return this.moveDirWithin(p, t)
        }, t.moveDir = function (t) {
            return i(t), r(this), this.selection ? this.insDirOf(t, this.selection.ends[t]).clearSelection() : this.moveDirWithin(t, this.root), this.show()
        }, t.moveLeft = function () {
            return this.moveDir(u)
        }, t.moveRight = function () {
            return this.moveDir(p)
        }, t.moveUp = function () {
            return e(this, "up")
        }, t.moveDown = function () {
            return e(this, "down")
        }, t.seek = function (t, e) {
            r(this);
            var n, i, s = this.clearSelection().show();
            return t.hasClass("empty") ? (s.insAtLeftEnd(v[t.attr(ce)]), s) : (n = v[t.attr(oe)], n instanceof x ? (t.outerWidth() > 2 * (e - t.offset().left) ? s.insLeftOf(n) : s.insRightOf(n), s) : (n || (i = v[t.attr(ce)], i || (t = t.parent(), n = v[t.attr(oe)], n || (i = v[t.attr(ce)], i || (i = s.root)))), n ? s.insRightOf(n) : s.insAtRightEnd(i), s.seekHoriz(e, s.root)))
        }, t.seekHoriz = function (t, e) {
            var i, r = this, s = n(r).left - t;
            do r.moveLeftWithin(e), i = s, s = n(r).left - t; while (s > 0 && (r[u] || r.parent !== e));
            return -s > i && r.moveRightWithin(e), r
        }, t.writeLatex = function (t) {
            var e, n, i, s = this;
            return r(s), s.show().deleteSelection(), e = l.all, n = l.eof, i = ie.skip(n).or(e.result(!1)).parse(t), i && (i.children().adopt(s.parent, s[u], s[p]), v.jQize(i.join("html")).insertBefore(s.jQ), s[u] = i.ends[p], i.finalizeInsert(), s.parent.bubble("redraw")), this.hide()
        }, t.write = function (t) {
            var e = this.prepareWrite();
            return this.insertCh(t, e)
        }, t.insertCh = function (t, e) {
            return this.parent.write(this, t, e), this
        }, t.insertCmd = function (t, e) {
            var n = S[t];
            return n ? (n = n(t), e && n.replaces(e), n.createLeftOf(this)) : (n = K(), n.replaces(t), n.ends[u].focus = function () {
                return delete this.focus, this
            }, n.createLeftOf(this), this.insRightOf(n), e && e.remove()), this
        }, t.unwrapGramp = function () {
            var t = this.parent.parent, e = t.parent, n = t[p], i = t[u];
            if (t.disown().eachChild(function (r) {
                    r.isEmpty() || (r.children().adopt(e, i, n).each(function (e) {
                        e.jQ.insertBefore(t.jQ.first())
                    }), i = r.ends[p])
                }), !this[p])if (this[u])this[p] = this[u][p]; else for (; !this[p];) {
                if (this.parent = this.parent[p], !this.parent) {
                    this[p] = t[p], this.parent = e;
                    break
                }
                this[p] = this.parent.ends[u]
            }
            this[p] ? this.insLeftOf(this[p]) : this.insAtRightEnd(e), t.jQ.remove(), t[u] && t[u].respace(), t[p] && t[p].respace()
        }, t.deleteDir = function (t) {
            if (i(t), r(this), this.show(), this.deleteSelection()); else if (this[t])this[t].isEmpty() ? this[t] = this[t].remove()[t] : this.selectDir(t); else if (this.parent !== this.root) {
                if (this.parent.parent.isEmpty())return this.insDirOf(-t, this.parent.parent).deleteDir(t);
                this.unwrapGramp()
            }
            return this[u] && this[u].respace(), this[p] && this[p].respace(), this.parent.bubble("redraw"), this
        }, t.backspace = function () {
            return this.deleteDir(u)
        }, t.deleteForward = function () {
            return this.deleteDir(p)
        }, t.selectFrom = function (t) {
            var e, n, i, r, s, a, o = this, c = t;
            t:for (; ;) {
                for (e = this; e !== o.parent.parent; e = e.parent.parent)if (e.parent === c.parent) {
                    i = e, r = c;
                    break t
                }
                for (n = t; n !== c.parent.parent; n = n.parent.parent)if (o.parent === n.parent) {
                    i = o, r = n;
                    break t
                }
                o.parent.parent && (o = o.parent.parent), c.parent.parent && (c = c.parent.parent)
            }
            if (i[p] !== r) {
                for (a = i; a; a = a[p])if (a === r[u]) {
                    s = !0;
                    break
                }
                s || (s = r, r = i, i = s)
            }
            this.hide().selection = se(i[u][p] || i.parent.ends[u], r[p][u] || r.parent.ends[p]), this.insRightOf(r[p][u] || r.parent.ends[p]), this.root.selectionChanged()
        }, t.selectDir = function (t) {
            if (i(t), r(this), this.selection)if (this.selection.ends[t] === this[-t])this[t] ? this.hopDir(t).selection.extendDir(t) : this.parent !== this.root && this.insDirOf(t, this.parent.parent).selection.levelUp(); else {
                if (this.hopDir(t), this.selection.ends[t] === this.selection.ends[-t])return this.clearSelection().show(), a;
                this.selection.retractDir(t)
            } else {
                if (this[t])this.hopDir(t); else {
                    if (this.parent === this.root)return;
                    this.insDirOf(t, this.parent.parent)
                }
                this.hide().selection = se(this[-t])
            }
            this.root.selectionChanged()
        }, t.selectLeft = function () {
            return this.selectDir(u)
        }, t.selectRight = function () {
            return this.selectDir(p)
        }, t.prepareMove = function () {
            return r(this), this.show().clearSelection()
        }, t.prepareEdit = function () {
            return r(this), this.show().deleteSelection()
        }, t.prepareWrite = function () {
            return r(this), this.show().replaceSelection()
        }, t.clearSelection = function () {
            return this.selection && (this.selection.clear(), delete this.selection, this.root.selectionChanged()), this
        }, t.deleteSelection = function () {
            return this.selection ? (this[u] = this.selection.ends[u][u], this[p] = this.selection.ends[p][p], this.selection.remove(), this.root.selectionChanged(), delete this.selection) : !1
        }, t.replaceSelection = function () {
            var t = this.selection;
            return t && (this[u] = t.ends[u][u], this[p] = t.ends[p][p], delete this.selection), t
        }
    }),se = c(k, function (t, e) {
        t.init = function () {
            var t = this;
            e.init.apply(t, arguments), t.jQwrap(t.jQ)
        }, t.jQwrap = function (t) {
            this.jQ = t.wrapAll('<span class="selection"></span>').parent()
        }, t.adopt = function () {
            return this.jQ.replaceWith(this.jQ = this.jQ.children()), e.adopt.apply(this, arguments)
        }, t.clear = function () {
            return this.jQ.replaceWith(this.jQ.children()), this
        }, t.levelUp = function () {
            var t = this, e = t.ends[u] = t.ends[p] = t.ends[p].parent.parent;
            return t.clear().jQwrap(e.jQ), t
        }, t.extendDir = function (t) {
            return i(t), this.ends[t] = this.ends[t][t], this.ends[t].jQ.insAtDirEnd(t, this.jQ), this
        }, t.extendLeft = function () {
            return this.extendDir(u)
        }, t.extendRight = function () {
            return this.extendDir(p)
        }, t.retractDir = function (t) {
            i(t), this.ends[-t].jQ.insDirOf(-t, this.jQ), this.ends[-t] = this.ends[-t][t]
        }, t.retractRight = function () {
            return this.retractDir(p)
        }, t.retractLeft = function () {
            return this.retractDir(u)
        }
    }),ae.fn.mathquill = function (t, e) {
        var n, i, s, a, o;
        switch (t) {
            case"redraw":
                return this.each(function () {
                    var t = f(this).attr(ce), e = t && v[t];
                    e && function n(t) {
                        t.eachChild(n), t.redraw && t.redraw()
                    }(e)
                });
            case"revert":
                return this.each(function () {
                    var t = f(this).attr(ce), e = t && v[t];
                    e && e.revert && e.revert()
                });
            case"latex":
                return arguments.length > 1 ? this.each(function () {
                    var t = f(this).attr(ce), n = t && v[t];
                    n && n.renderLatex(e)
                }) : (n = f(this).attr(ce), i = n && v[n], i && i.latex());
            case"text":
                return n = f(this).attr(ce), i = n && v[n], i && i.text();
            case"html":
                return this.html().replace(/ ?hasCursor|hasCursor /, "").replace(/ class=(""|(?= |>))/g, "").replace(/<span class="?cursor( blink)?"?><\/span>/i, "").replace(/<span class="?textarea"?><textarea><\/textarea><\/span>/i, "");
            case"write":
                if (arguments.length > 1)return this.each(function () {
                    var t = f(this).attr(ce), n = t && v[t], i = n && n.cursor;
                    i && i.writeLatex(e).parent.blur()
                });
            case"cmd":
                if (arguments.length > 1)return this.each(function () {
                    var t, n = f(this).attr(ce), i = n && v[n], r = i && i.cursor;
                    r && (t = r.prepareWrite(), /^\\[a-z]+$/i.test(e) ? r.insertCmd(e.slice(1), t) : r.insertCh(e, t), r.hide().parent.blur())
                });
            default:
                return s = "textbox" === t, a = s || "editable" === t, o = s ? Q : q, this.each(function () {
                    r(f(this), o(), s, a)
                })
        }
    },ae(function () {
        ae(".mathquill-editable:not(.mathquill-rendered-math)").mathquill("editable"), ae(".mathquill-textbox:not(.mathquill-rendered-math)").mathquill("textbox"), ae(".mathquill-embedded-latex").mathquill()
    })
})();
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



/**
 * Created by supostat on 05.11.15.
 */
app.service('AnswersModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'answers';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function (id) {
        return $http.get(getUrl() + '/list/' + id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
}]);
/**
 * Created by supostat on 05.11.15.
 */
app.service('ExamsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'examtype';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function () {
        return $http.get(getUrl());
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
}]);
/**
 * Created by supostat on 05.11.15.
 */
app.service('QuestionsModel', ['$http', 'ENDPOINT_URI', 'Upload', function ($http, ENDPOINT_URI, Upload) {
    var service = this,
        path = 'questions';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function (id) {
        return $http.get(getUrl() + '/list?quiz_id=' + id);
    };

    service.images = function (id) {
        return $http.get(getUrl() + '/images?question_id=' + id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function (item) {
        return Upload.upload({
            url: getUrl(),
            data: {
                'Question[imageFiles]': item.files,
                question: item.question
            }
        });
    };

    service.update = function (itemId, item) {
        return Upload.upload({
            url: getUrl()+'/update/' + itemId,
            data: {
                'Question[imageFiles]': item.newImages,
                question: item.question,
                oldImages: item.oldImages
            },
            method: 'POST'
        });
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
}]);
/**
 * Created by supostat on 05.11.15.
 */
app.service('QuizzesModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'quizes';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function (subject_id) {
        return $http.get(getUrl() + '/all?subject_id=' + subject_id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
}]);
/**
 * Created by supostat on 05.11.15.
 */
app.service('SubjectsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'subjects';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function (exam_id) {
        return $http.get(getUrl() + '/all?exam_id=' + exam_id);
    };

    service.getOriginList = function (exam_id) {
        return $http.get(getUrl() + '/list?exam_id=' + exam_id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
}]);
/**
 * Created by supostat on 09.11.15.
 */

app.service('SubtopicsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'subtopic';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function (topic_id) {
        return $http.get(getUrl() + '/all?id=' + topic_id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };

}]);

/**
 * Created by supostat on 09.11.15.
 */

app.service('TopicsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'topic';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function (subject_id) {
        return $http.get(getUrl() + '/all?id=' + subject_id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };

}]);

/**
 * Created by supostat on 05.11.15.
 */

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        tinyMCE.baseURL = '/js/tinymce-dist';
        tinyMCE.PluginManager.load('equationeditor', '/js/tinymce-dist/plugins/equation/plugin.min.js');
        $urlRouterProvider.otherwise('/exam');
        $stateProvider
            .state('examIndex', {
                url: '/exam',
                templateUrl: '/js/app/templates/exam/exam-index.tpl.html',
                controller: 'ExamTypeController',
                ncyBreadcrumb: {
                    label: 'Home'
                }
            })
            .state('examIndex.exam', {
                url: '/:exam_id',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/exam/exam-show.tpl.html',
                        controller: 'ExamTypeEditController'
                    },
                    'subjects@examIndex.exam': {
                        templateUrl: '/js/app/templates/subject/subject-list.tpl.html',
                        controller: 'SubjectsController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Exam: {{ examName }}',
                }
            })
            .state('examIndex.exam.subjectShow', {
                url: '/subject/:subject_id',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/subject/subject-show.tpl.html',
                        controller: function ($scope, $state) {
                            $scope.go = function(route){
                                $state.go(route);
                            };
                            $scope.active = function(route){
                                return $state.includes(route);
                            };
                            $scope.tabs = [
                                { heading: "Video", route:"examIndex.exam.subjectShow.video", active:false },
                                { heading: "Quizzes", route:"examIndex.exam.subjectShow.quizzes", active:true },
                            ];

                            $scope.$on("$stateChangeSuccess", function() {
                                $scope.tabs.forEach(function(tab) {
                                    tab.active = $scope.active(tab.route);
                                });
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Subject',
                    skip: true,
                    includeAbstract: true,
                }
            })
            .state('examIndex.exam.topic', {
                'url': '/subject/:subject_id/topic',
                views: {
                    'topics@examIndex.exam': {
                        templateUrl: '/js/app/templates/topic/topic-list.tpl.html',
                        controller: 'TopicListController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Topics',
                }
            })
            .state('examIndex.exam.topic.subtopic', {
                'url': '/:topic_id/subtopic',
                views: {
                    'subtopics@examIndex.exam': {
                        templateUrl: '/js/app/templates/subtopic/subtopic-list.tpl.html',
                        controller: 'SubTopicListCtrl'
                    }
                },
                ncyBreadcrumb: {
                    label: 'SubTopics',
                }
            })
            .state('examIndex.exam.subjectShow.video', {
                url: '/video',
                templateUrl: '/js/app/templates/video/subject-video-index.tpl.html',
                ncyBreadcrumb: {
                    label: 'Video'
                },
            })
            .state('examIndex.exam.subjectShow.quizzes', {
                url: '/quizzes',
                controller: 'QuizzesController',
                templateUrl: '/js/app/templates/quiz/subject-quiz-index.tpl.html',
                onExit: function ($rootScope) {
                    $rootScope.subjectName = undefined;
                },
                ncyBreadcrumb: {
                    label: '{{ subjectName }}: Quizzes'
                },
            })
            .state('examIndex.exam.subjectShow.quizzes.create', {
                url: '/create',
                views: {
                    '@examIndex.exam.subjectShow': {
                        templateUrl: '/js/app/templates/quiz/subject-quiz-create.tpl.html',
                        controller: 'QuizzesCreateController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.edit', {
                url: '/edit/:quiz_id',
                views: {
                    '@examIndex.exam.subjectShow': {
                        templateUrl: '/js/app/templates/quiz/subject-quiz-edit.tpl.html',
                        controller: 'QuizzesEditController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question', {
                url: '/:quiz_id/question',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/question/subject-quiz-question-index.tpl.html',
                        controller: 'QuestionsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Questions',
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.create', {
                url: '/create',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/question/subject-quiz-question-new.tpl.html',
                        controller: 'QuestionCreateController'
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/js/app/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                    'topic@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/js/app/templates/topic/topic-dropdown.tpl.html',
                        controller: 'TopicListController'
                    },
                    'subtopic@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/js/app/templates/subtopic/subtopic-dropdown.tpl.html',
                        controller: 'SubTopicDropdownController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.edit', {
                url: '/edit/:question_id',
                views: {
                    '@': {
                        templateUrl: '/js/app/templates/question/subject-quiz-question-edit.tpl.html',
                        controller: 'QuestionsUpdateController',
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.edit': {
                        templateUrl: '/js/app/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            });
    }]);
/**
 * Created by supostat on 02.11.15.
 */

app.service('answersService', function($http, $stateParams, $state) {
    var answers = [];

    var addAnswer = function(newObj) {
        answers.push(newObj);
    };

    var init = function(data) {
        answers = data;
    };

    var getAnswers = function(){
        return answers;
    };

    return {
        addAnswer: addAnswer,
        getAnswers: getAnswers,
        init: init
    };

});
/**
 * Created by supostat on 09.11.15.
 */


app.factory('QuestionsService', ['TopicsModel', 'SubtopicsModel', function (TopicsModel, SubtopicsModel) {
    var topics = {},
        subtopics = {},
        answers = {},
        images = [];

    answers.list = [];
    topics.list = [];
    subtopics.list = [];
    topics.selected = {};
    subtopics.selected = {};

    answers.init = function (data) {
        answers.list = data;
    };

    answers.add = function(newObj) {
        answers.list.push(newObj);
    };

    subtopics.select = function (data) {
        subtopics.selected = data;
    };
    topics.select = function (data) {
        topics.selected = data;
    };

    answers.get = function(){
        return answers.list;
    };

    topics.init = function(data) {
       topics.list = data;
    };

    topics.add = function(newTopic) {
       topics.list.push(newTopic);
    };

    subtopics.init = function (data) {
        angular.forEach(data, function (value, key) {
            subtopics.add(value);
        })
    };

    subtopics.add = function(newSubtopic) {
        subtopics.list.push(newSubtopic);
    };

    return {
        answers: answers,
        topics: topics,
        subtopics: subtopics
    }
}]);
/**
 * Created by supostat on 09.11.15.
 */

app.factory('Test', [function () {
    var fn = {};

    fn.item = {
        FirstName: ''
    };

    return fn;
}]);
/**
 * Created by supostat on 02.11.15.
 */
app.controller('AnswersController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'AnswersModel',
    function ($http, $scope, $stateParams, $state, QuestionsService, AnswersModel) {
        var question_id = $stateParams.question_id;

        function getAnswers(){
            if(!question_id) {
                var empty = [];
                QuestionsService.answers.init(empty);
                $scope.answers = empty;
            } else {
                AnswersModel.all(question_id).then(function (result) {
                    QuestionsService.answers.init(result.data);
                    $scope.answers = result.data;
                });
            }
        }

        function addAnswer() {
            $scope.newAnswer.correct = 0;
            $scope.newAnswer.question_id = question_id;
            QuestionsService.answers.add($scope.newAnswer);
            console.log(QuestionsService.answers.get());
            $scope.newAnswer = {};
        }

        function setRightAnswer(index, e){
            if($(e.target).is('td')) {
                for (var i in $scope.answers) {
                    $scope.answers[i].correct = 0;
                }
                $scope.answers[index].correct = 1;
                QuestionsService.answers.init($scope.answers);
            }
        };

        function deleteAnswer(id, e) {
            for (var key in $scope.answers) {
                if (key == id) {
                    $scope.answers.splice(key, 1);
                    break;
                }
            }
            QuestionsService.answers.init($scope.answers);
        };

        //
        //$scope.updateAnswer = function (id) {
        //    for (var key in $scope.answers) {
        //        if (key == id) {
        //            var answ = $scope.answers[key];
        //            break;
        //        }
        //    }
        //};
        //

        function checkName(data) {
            if (data.trim() == '') {
                return "Field cannot be blank";
            }
        };

        $scope.newAnswer = {};
        $scope.answers = [];
        $scope.addAnswer = addAnswer;
        $scope.setRightAnswer = setRightAnswer;
        $scope.deleteAnswer = deleteAnswer;
        $scope.checkName = checkName;

        getAnswers();
    }
]);
/**
 * Created by supostat on 01.11.15.
 */

app.controller('ExamTypeController', ['$http', '$scope', 'ExamsModel', '$rootScope', function ($http, $scope, ExamsModel, $rootScope) {

    function getExams() {
        ExamsModel.all().then(function (result) {
            $scope.exams = result.data;
        });
    }

    function createExam(exam) {
        ExamsModel.create(exam)
            .then(function (result) {
                $scope.newExam = {};
                getExams();
            });
    }

    function updateExam(exam) {
        ExamsModel.update(exam.id, exam)
            .then(function (result) {
                getExams();
            });
    }

    function deleteExam(examId) {
        ExamsModel.destroy(examId)
            .then(function (result) {
                getExams();
            });
    }

    $scope.exams = [];
    $scope.newExam = {};

    $scope.deleteExam = deleteExam;
    $scope.createExam = createExam;
    $scope.updateExam = updateExam;

    $scope.title = 'Grade level';

    getExams();
}]);
/**
 * Created by supostat on 13.11.15.
 */


app.controller('ExamTypeEditController', ['ExamsModel', '$rootScope', '$stateParams', function (ExamsModel, $rootScope, $stateParams) {
    ExamsModel.fetch($stateParams.exam_id).then(function (result) {
        $rootScope.examName = result.data.name;
    });
}]);
/**
 * Created by supostat on 16.11.15.
 */

app.controller('PracticeExamListController', ['$scope', '$window', function ($scope) {
    $scope.name = 'Name';
}]);
/**
 * Created by supostat on 02.11.15.
 */

app.controller('QuestionCreateController',['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'QuestionsModel',
    'AnswersModel', 'SubtopicsModel', 'TopicsModel', 'Upload', '$timeout',
    function ($http, $scope, $stateParams, $state, QuestionsService, QuestionsModel, AnswersModel, SubtopicsModel, TopicsModel, Upload, $timeout) {

        var quiz_id = $stateParams.quiz_id;

        function saveQuestion() {
            console.log($scope.selectedTopic);
            var data = {
                question: {
                    content: $scope.question.content,
                    topic_id: !$scope.selectedTopic?'':$scope.selectedTopic.id,
                    subtopic_id: !$scope.selectedSubTopic?'':$scope.selectedSubTopic.id,
                    quize_id: quiz_id
                },
                files: $scope.files
            };
            console.log(data);
            QuestionsModel.create(data).then(function (result) {
                var answers = QuestionsService.answers.get();
                angular.forEach(answers, function (value, key) {
                    value.question_id = result.data.id;
                });
                console.log(answers);
                return AnswersModel.create(answers);
            }).then(function (result) {
                $state.go('examIndex.exam.subjectShow.quizzes.question', null, {reload: true});
            })

        }

        var getTopics = function () {
            var subject_id = $stateParams.subject_id;
            TopicsModel.all(subject_id).then(function (result) {
                $scope.topics = result.data;
            });
        };

        $scope.removeImage = function(file) {
            angular.forEach($scope.files, function (value, key) {
                if($scope.files[key] == file) {
                    $scope.files.splice(key, 1);
                }
            })
        };

        $scope.uploadFiles = function (files) {
            $scope.files = files;
        };

        $scope.question = {};

        $scope.$watch('selectedTopic', function (selectedTopic) {
            if (selectedTopic) {
                SubtopicsModel.all(selectedTopic.id).then(function (result) {
                    $scope.subtopics = result.data;
                });
            }
        });

        $scope.tinymceOptions = {
            setup: function (ed) {
                ed.on('init', function(args) {
                    $('.mce-edit-area').writemaths({iFrame: true});
                });
            },
            resize: false,
            height: 300,
            plugins: 'equationeditor',
            toolbar: "undo redo equationeditor"
        };

        getTopics();

        $scope.saveQuestion = saveQuestion;
        $scope.selectedTopic = null;
        $scope.selectedSubTopic = null;
    }
]);
/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuestionsController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsModel',
    function ($http, $scope, $stateParams, $state, QuestionsModel) {

        var quiz_id = $stateParams.quiz_id;
        function getQuestions() {
            QuestionsModel.all(quiz_id).then(function (result) {
                if (result.data == false) {
                    $scope.isEmptyQuestions = true;
                } else {
                    $scope.isEmptyQuestions = false;
                }
                $scope.questions = result.data;
            });
        }

        function loadQuestionsFromXls() {
            console.log('asf');
        }

        function deleteQuestion(question_id) {
            QuestionsModel.destroy(question_id).then(function (result) {
                if ($scope.questions == false) {
                    $scope.isEmptyQuestions = true;
                } else {
                    $scope.isEmptyQuestions = false;
                }
                getQuestions();
            })
        }

        $scope.questions = [];
        $scope.isEmptyQuestions = false;
        $scope.deleteQuestion = deleteQuestion;
        $scope.loadQuestionsFromXls = loadQuestionsFromXls;

        getQuestions();
    }
]);
/**
 * Created by supostat on 02.11.15.
 */

app.controller('QuestionsUpdateController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService',
    'QuestionsModel', 'AnswersModel', 'SubtopicsModel', 'TopicsModel', 'Lightbox', 'Upload', '$timeout',
    function ($http, $scope, $stateParams, $state, QuestionsService, QuestionsModel, AnswersModel, SubtopicsModel, TopicsModel, Lightbox, Upload, $timeout) {

        var question_id = $stateParams.question_id;

        function getQuestion() {
            QuestionsModel.fetch(question_id).then(function (result) {
                $scope.question = result.data;
                $('.mce-edit-area').writemaths({iFrame: true});
                getTopics();
            });
        }

        function updateQuestion(question) {
            question.topic_id = $scope.selectedTopic.id;
            question.subtopic_id = $scope.selectedSubTopic.id;

            var data = {
                question: question,
                newImages: $scope.newImages,
                oldImages: $scope.images
            };

            QuestionsModel.update(question.id, data).then(function (result) {
            }).then(function (result) {
                return AnswersModel.update(question_id, QuestionsService.answers.get());
            }).then(function (result) {
                $state.go('examIndex.exam.subjectShow.quizzes.question', null, {reload: true});
            })
        }

        $scope.uploadImages = function (files) {
            if(files) {
                $scope.newImages = $scope.newImages.concat(files);
                console.log($scope.newImages);
            }
        };

        function getQuestionImages() {
            QuestionsModel.images(question_id).then(function (result) {
                $scope.images = result.data;
            })
        }

        var getTopics = function () {
            var subject_id = $stateParams.subject_id;
            TopicsModel.all(subject_id).then(function (result) {
                $scope.topics = result.data;
                angular.forEach($scope.topics, function (value, key) {
                    if (value.id == $scope.question.topic_id) {
                        $scope.selectedTopic = value;
                    }
                });
            });
        };

        $scope.removeImage = function(images, image) {
            angular.forEach(images, function (value, key) {
                if(images[key] == image) {
                    images.splice(key, 1);
                }
            })
        };

        $scope.openLightboxModal = function (index) {
            Lightbox.openModal($scope.images, index);
        };

        $scope.$watch('selectedTopic', function (selectedTopic) {
            console.log(selectedTopic);
            if (selectedTopic) {
                SubtopicsModel.all(selectedTopic.id).then(function (result) {
                    $scope.subtopics = result.data;
                    angular.forEach($scope.subtopics, function (value, key) {
                        if (value.id == $scope.question.subtopic_id) {
                            $scope.selectedSubTopic = value;
                        }
                    });
                });
            } else {
                $scope.subtopics = [];
            }
        });

        $scope.question = {};
        $scope.topics = [];
        $scope.subtopics = [];
        $scope.images = [];
        $scope.newImages = [];
        $scope.updateQuestion = updateQuestion;

        $scope.selectedTopic = {};
        $scope.selectedSubTopic = {};

        $scope.tinymceOptions = {
            resize: false,
            height: 300,
            plugins: 'equationeditor',
            toolbar: "undo redo equationeditor"
        };

        getQuestion();
        getQuestionImages();
    }
]);
/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuizzesCreateController', ['$http', '$scope', '$state', '$stateParams', '$filter', 'QuizzesModel', function ($http, $scope, $state, $stateParams, $filter, QuizzesModel) {

    var subject_id = $stateParams.subject_id;

    function saveQuiz() {
        var quiz = $scope.quiz;
        quiz.subject_id = subject_id;
        quiz.date = moment(quiz.date).format("YYYY-MM-DD");
        quiz.hours = (quiz.hours.getHours() * 60) + quiz.hours.getMinutes();
        QuizzesModel.create(quiz).then(function (result) {
            $state.go('examIndex.exam.subjectShow.quizzes', {}, {reload: true});
        })
    }

    $scope.submit = function () {
        if(!$scope.quizForm.$invalid) {
            saveQuiz();
        }
    };

    $scope.onTimeSet = function (newDate, oldDate) {
        $scope.quiz.date = $filter('date')(newDate, "MMMM yyyy");
    };

    var date = new Date();
    date.setHours(1);
    date.setMinutes(0);
    $scope.quiz = {};
    $scope.quiz.hours = date;
    $scope.subject_id = subject_id;
    $scope.saveQuiz = saveQuiz;
    $scope.submitted = false;
}]);
/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuizzesController', ['$http', '$scope', '$state', '$stateParams', 'QuizzesModel', 'ngDialog', 'Upload', '$timeout', 'notify', 'SubjectsModel', '$rootScope',
    function ($http, $scope, $state, $stateParams, QuizzesModel, ngDialog, Upload, $timeout, notify, SubjectsModel, $rootScope) {
    var subject_id = $stateParams.subject_id;

    SubjectsModel.fetch(subject_id).then(function (result) {
        $rootScope.subjectName = result.data.name;
        console.log($rootScope.subjectName);
    });

    function getQuizzes() {
        QuizzesModel.all(subject_id).then(function (result) {
            $scope.quizzes = result.data;
        });
    }

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });
    $scope.log = '';
    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!file.$error) {
                    $scope.myPromise = Upload.upload({
                        url: '/v1/question/import',
                        data: {
                            "UploadExamForm[examFile]": file,
                            subject_id: $stateParams.subject_id
                        }
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.log = 'progress: ' + progressPercentage + '% ' +
                            evt.config.data['UploadExamForm[examFile]'].name + '\n' + $scope.log;
                    }).success(function (data, status, headers, config) {
                        getQuizzes();
                        notify({
                            message: 'Import complete',
                            //templateUrl: '/js/app/templates/noty/gmail-template.html',
                            position: 'center'
                        });
                    }).error(function (data, status) {
                        if(status == 422) {
                            var message = '';
                            angular.forEach(data, function (value, key) {
                                message = value.field + ': ' + value.message;
                                notify({
                                    message: message,
                                    //templateUrl: '/js/app/templates/noty/gmail-template.html',
                                    position: 'center'
                                });
                            });


                        } else {
                            console.log('Error:', data);
                        }
                    });
                }
            }
        }
    };


    function deleteQuiz(quiz) {
        $scope.deletedQuiz = quiz;
        ngDialog.openConfirm({
            template: 'templateId',
            scope: $scope,
            showClose: false
        }).then(function (quiz_id) {
            QuizzesModel.destroy(quiz_id).then(function (result) {
                getQuizzes();
            })
        });
    }
    function openQuiz(quiz_id) {
        console.log(quiz_id);
        $state.go('.question', {quiz_id: quiz_id});
    }

    $scope.subject_id = subject_id;
    $scope.quizzes = [];

    $scope.deleteQuiz = deleteQuiz;
    $scope.openQuiz = openQuiz;

    getQuizzes();
}]);
/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuizzesEditController', ['$http', '$scope', '$state', '$stateParams', 'QuizzesModel', '$filter', function ($http, $scope, $state, $stateParams, QuizzesModel, $filter) {

    var subject_id = $stateParams.subject_id;
    var quiz_id = $stateParams.quiz_id;

    function getQuiz() {
        QuizzesModel.fetch(quiz_id).then(function (result) {
            result.data.date = $filter('date')(result.data.date, "MMMM yyyy");
            $scope.quiz = result.data;
            var date = new Date();
            date.setHours($scope.quiz.hours / 60);
            date.setMinutes($scope.quiz.hours % 60);
            $scope.quiz.hours = date;
        });
    }

    function updateQuiz() {
        var quiz = {
            name: $scope.quiz.name,
            description: $scope.quiz.description,
            subject_id : subject_id,
            date : moment($scope.quiz.date).format("YYYY-MM-DD"),
            hours : ($scope.quiz.hours.getHours() * 60) + $scope.quiz.hours.getMinutes()
        };
        QuizzesModel.update(quiz_id, quiz).then(function (result) {
            $state.go('examIndex.exam.subjectShow.quizzes', {}, {reload: true});
        })
    }

    $scope.submit = function () {
        if(!$scope.quizForm.$invalid) {
            updateQuiz();
        }
    };

    $scope.onTimeSet = function (newDate, oldDate) {
        $scope.quiz.date = $filter('date')(newDate, "MMMM yyyy");
    };

    $scope.subject_id = subject_id;
    $scope.quiz = {};

    $scope.updateQuiz = updateQuiz;

    getQuiz();
}]);
/**
 * Created by supostat on 09.11.15.
 */
app.controller('SubTopicDropdownController', ['QuestionsService', '$scope', 'Test', function (QuestionsService, $scope, Test) {
    $scope.subtopics = QuestionsService.subtopics.list;
    $scope.$watch('subtopic', function (subtopic) {
        QuestionsService.subtopics.selected = subtopic;
    });
}]);
/**
 * Created by supostat on 04.11.15.
 */

app.controller('SubTopicListCtrl', ['$http', '$scope', '$stateParams', '$state', 'SubtopicsModel', 'QuestionsService', function ($http, $scope, $stateParams, $state, SubtopicsModel, QuestionsService) {
    $scope.subtopics = QuestionsService.subtopics.list;
    $scope.newSubTopic = {};
    $scope.isEmptySubTopics = false;

    var getSubtopics = function () {
        var topic_id = $stateParams.topic_id;
        SubtopicsModel.all(topic_id).then(function (result) {
            $scope.subtopics = result.data;
            if ($scope.subtopics == false) {
                $scope.isEmptySubTopics = true;
            } else {
                $scope.isEmptySubTopics = false;
            }
        });
    };

    $scope.createSubTopic = function () {
        $scope.newSubTopic.topic_id = $stateParams.topic_id;
        $http.post('/v1/subtopic/create', $scope.newSubTopic)
            .success(function (data, status, headers, config) {
                var subtopic = {
                    'id': data.id,
                    'name': data.name,
                    'topic_id': data.topic_id
                };
                $scope.subtopics.push(subtopic);
                $scope.isEmptySubTopics = false;
            })
            .finally(function (data, status, headers, config) {
                $scope.newSubTopic = '';
            });
    };

    $scope.deleteSubtopic = function (id) {
        $http.delete('/v1/subtopic/delete?id=' + $scope.subtopics[id].id).
            success(function () {
                $scope.subtopics.splice(id, 1);
                if ($scope.subtopics == false) {
                    $scope.isEmptySubTopics = true;
                } else {
                    $scope.isEmptySubTopics = false;
                }
            });
    };

    $scope.updateSubTopic = function (id) {
        var subtopic;
        for (var key in $scope.subtopics) {
            if ($scope.subtopics[key].id == id) {
                subtopic = $scope.subtopics[key];
                break;
            }
        }
        ;
        $http.put('/v1/subtopic/update?id=' + id, subtopic);
    };

    getSubtopics();
}
]);
/**
 * Created by supostat on 02.11.15.
 */

app.controller('SubjectsController', ['$http', '$scope', '$state', '$stateParams', 'SubjectsModel', function ($http, $scope, $state, $stateParams, SubjectsModel) {

    var exam_id = $stateParams.exam_id;

    function getOriginList() {
        SubjectsModel.getOriginList(exam_id).then(function (result) {
            if(result.data == false) {
                $scope.isEmptyOriginSubjects = true;
            } else {
                $scope.isEmptyOriginSubjects = false;
            }
            $scope.listOrigin = result.data;
        })
    }

    function getSubjects() {
        var exam_id = $stateParams.exam_id;
        SubjectsModel.all(exam_id).then(function (result) {
            if(result.data == false) {
                $scope.isEmptySubjects = true;
            } else {
                $scope.isEmptySubjects = false;
            }
            $scope.subjects = result.data;
        });
    }

    function addSubject(subject) {
        var selectedSubject = {
            name: subject.name,
            subject_origin_id: subject.id,
            examtype_id: $stateParams.exam_id
        };
        SubjectsModel.create(selectedSubject)
            .then(function (result) {
                getSubjects();
                getOriginList();
            });
    }

    function deleteSubject(subjectId) {
        SubjectsModel.destroy(subjectId)
            .then(function (result) {
                getSubjects();
                getOriginList();
            });
    }

    function showTopics(subject_id, e) {
        if($(e.target).is('td')) {
            $(e.target).parent('tr').siblings().removeClass('active');
            $(e.target).parent('tr').addClass('active');
            $state.go('examIndex.exam.topic', {subject_id: subject_id});
        }
    };

    $scope.listOrigin = [];
    $scope.exam_id = exam_id;
    $scope.suffix = "Test breadcrumb";
    $scope.isEmptySubjects = false;
    $scope.isEmptyOriginSubjects = false;

    $scope.addSubject = addSubject;
    $scope.deleteSubject = deleteSubject;
    $scope.showTopics = showTopics;

    getSubjects();
    getOriginList();
}
]);
/**
 * Created by supostat on 04.11.15.
 */

app.controller('TopicListController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'TopicsModel', 'SubtopicsModel', 'Test',
    function ($http, $scope, $stateParams, $state, QuestionsService, TopicsModel, SubtopicsModel, Test) {
        $scope.td = Test;
        $scope.newTopic = {};
        $scope.isEmptyTopics = false;

        var getTopics = function () {
            var subject_id = $stateParams.subject_id;
            TopicsModel.all(subject_id).then(function (result) {
                QuestionsService.topics.init(result.data);
                $scope.topics = QuestionsService.topics.list;
                if (result.data == false) {
                    $scope.isEmptyTopics = true;
                } else {
                    $scope.isEmptyTopics = false;
                }
            });
        };

        $scope.showSubTopics = function (topic_id, e) {
            if ($(e.target).is('td')) {
                $(e.target).parent('tr').siblings().removeClass('active');
                $(e.target).parent('tr').addClass('active');
                $state.go('examIndex.exam.topic.subtopic', {topic_id: topic_id});
            }
        };

        $scope.subtopics = QuestionsService.subtopics.list;
        $scope.createTopic = function () {
            $scope.newTopic.subject_id = $stateParams.subject_id;
            $http.post('/v1/topic/create', $scope.newTopic)
                .success(function (data, status, headers, config) {
                    var topic = {
                        'id': data.id,
                        'name': data.name,
                        'subject_id': data.subject_id
                    };
                    QuestionsService.topics.add(topic);
                    $scope.isEmptyTopics = false;
                })
                .finally(function (data, status, headers, config) {
                    $scope.newTopic = '';
                });
        };

        $scope.deleteTopic = function (id) {
            $http.delete('/v1/topic/delete?id=' + $scope.topics[id].id).
                success(function () {
                    QuestionsService.topics.list.splice(id, 1);
                    if ($scope.topics == false) {
                        $scope.isEmptyTopics = true;
                    } else {
                        $scope.isEmptyTopics = false;
                    }
                });
        };

        $scope.updateTopic = function (id) {
            var topic;
            for (var key in $scope.topics) {
                if ($scope.topics[key].id == id) {
                    topic = $scope.topics[key];
                    break;
                }
            }
            ;
            $http.put('/v1/topic/update?id=' + id, topic);
        };

        getTopics();
    }
]);
//# sourceMappingURL=angular.js.map
