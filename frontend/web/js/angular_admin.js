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
/*!
 * angular-translate - v2.7.2 - 2015-06-01
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    factory();
  }
}(this, function () {

/**
 * @ngdoc overview
 * @name pascalprecht.translate
 *
 * @description
 * The main module which holds everything together.
 */
angular.module('pascalprecht.translate', ['ng'])
  .run(runTranslate);

function runTranslate($translate) {

  'use strict';

  var key = $translate.storageKey(),
    storage = $translate.storage();

  var fallbackFromIncorrectStorageValue = function () {
    var preferred = $translate.preferredLanguage();
    if (angular.isString(preferred)) {
      $translate.use(preferred);
      // $translate.use() will also remember the language.
      // So, we don't need to call storage.put() here.
    } else {
      storage.put(key, $translate.use());
    }
  };

  fallbackFromIncorrectStorageValue.displayName = 'fallbackFromIncorrectStorageValue';

  if (storage) {
    if (!storage.get(key)) {
      fallbackFromIncorrectStorageValue();
    } else {
      $translate.use(storage.get(key))['catch'](fallbackFromIncorrectStorageValue);
    }
  } else if (angular.isString($translate.preferredLanguage())) {
    $translate.use($translate.preferredLanguage());
  }
}
runTranslate.$inject = ['$translate'];

runTranslate.displayName = 'runTranslate';

/**
 * @ngdoc object
 * @name pascalprecht.translate.$translateSanitizationProvider
 *
 * @description
 *
 * Configurations for $translateSanitization
 */
angular.module('pascalprecht.translate').provider('$translateSanitization', $translateSanitizationProvider);

function $translateSanitizationProvider () {

  'use strict';

  var $sanitize,
      currentStrategy = null, // TODO change to either 'sanitize', 'escape' or ['sanitize', 'escapeParameters'] in 3.0.
      hasConfiguredStrategy = false,
      hasShownNoStrategyConfiguredWarning = false,
      strategies;

  /**
   * Definition of a sanitization strategy function
   * @callback StrategyFunction
   * @param {string|object} value - value to be sanitized (either a string or an interpolated value map)
   * @param {string} mode - either 'text' for a string (translation) or 'params' for the interpolated params
   * @return {string|object}
   */

  /**
   * @ngdoc property
   * @name strategies
   * @propertyOf pascalprecht.translate.$translateSanitizationProvider
   *
   * @description
   * Following strategies are built-in:
   * <dl>
   *   <dt>sanitize</dt>
   *   <dd>Sanitizes HTML in the translation text using $sanitize</dd>
   *   <dt>escape</dt>
   *   <dd>Escapes HTML in the translation</dd>
   *   <dt>sanitizeParameters</dt>
   *   <dd>Sanitizes HTML in the values of the interpolation parameters using $sanitize</dd>
   *   <dt>escapeParameters</dt>
   *   <dd>Escapes HTML in the values of the interpolation parameters</dd>
   *   <dt>escaped</dt>
   *   <dd>Support legacy strategy name 'escaped' for backwards compatibility (will be removed in 3.0)</dd>
   * </dl>
   *
   */

  strategies = {
    sanitize: function (value, mode) {
      if (mode === 'text') {
        value = htmlSanitizeValue(value);
      }
      return value;
    },
    escape: function (value, mode) {
      if (mode === 'text') {
        value = htmlEscapeValue(value);
      }
      return value;
    },
    sanitizeParameters: function (value, mode) {
      if (mode === 'params') {
        value = mapInterpolationParameters(value, htmlSanitizeValue);
      }
      return value;
    },
    escapeParameters: function (value, mode) {
      if (mode === 'params') {
        value = mapInterpolationParameters(value, htmlEscapeValue);
      }
      return value;
    }
  };
  // Support legacy strategy name 'escaped' for backwards compatibility.
  // TODO should be removed in 3.0
  strategies.escaped = strategies.escapeParameters;

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateSanitizationProvider#addStrategy
   * @methodOf pascalprecht.translate.$translateSanitizationProvider
   *
   * @description
   * Adds a sanitization strategy to the list of known strategies.
   *
   * @param {string} strategyName - unique key for a strategy
   * @param {StrategyFunction} strategyFunction - strategy function
   * @returns {object} this
   */
  this.addStrategy = function (strategyName, strategyFunction) {
    strategies[strategyName] = strategyFunction;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateSanitizationProvider#removeStrategy
   * @methodOf pascalprecht.translate.$translateSanitizationProvider
   *
   * @description
   * Removes a sanitization strategy from the list of known strategies.
   *
   * @param {string} strategyName - unique key for a strategy
   * @returns {object} this
   */
  this.removeStrategy = function (strategyName) {
    delete strategies[strategyName];
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateSanitizationProvider#useStrategy
   * @methodOf pascalprecht.translate.$translateSanitizationProvider
   *
   * @description
   * Selects a sanitization strategy. When an array is provided the strategies will be executed in order.
   *
   * @param {string|StrategyFunction|array} strategy The sanitization strategy / strategies which should be used. Either a name of an existing strategy, a custom strategy function, or an array consisting of multiple names and / or custom functions.
   * @returns {object} this
   */
  this.useStrategy = function (strategy) {
    hasConfiguredStrategy = true;
    currentStrategy = strategy;
    return this;
  };

  /**
   * @ngdoc object
   * @name pascalprecht.translate.$translateSanitization
   * @requires $injector
   * @requires $log
   *
   * @description
   * Sanitizes interpolation parameters and translated texts.
   *
   */
  this.$get = ['$injector', '$log', function ($injector, $log) {

    var applyStrategies = function (value, mode, selectedStrategies) {
      angular.forEach(selectedStrategies, function (selectedStrategy) {
        if (angular.isFunction(selectedStrategy)) {
          value = selectedStrategy(value, mode);
        } else if (angular.isFunction(strategies[selectedStrategy])) {
          value = strategies[selectedStrategy](value, mode);
        } else {
          throw new Error('pascalprecht.translate.$translateSanitization: Unknown sanitization strategy: \'' + selectedStrategy + '\'');
        }
      });
      return value;
    };

    // TODO: should be removed in 3.0
    var showNoStrategyConfiguredWarning = function () {
      if (!hasConfiguredStrategy && !hasShownNoStrategyConfiguredWarning) {
        $log.warn('pascalprecht.translate.$translateSanitization: No sanitization strategy has been configured. This can have serious security implications. See http://angular-translate.github.io/docs/#/guide/19_security for details.');
        hasShownNoStrategyConfiguredWarning = true;
      }
    };

    if ($injector.has('$sanitize')) {
      $sanitize = $injector.get('$sanitize');
    }

    return {
      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translateSanitization#useStrategy
       * @methodOf pascalprecht.translate.$translateSanitization
       *
       * @description
       * Selects a sanitization strategy. When an array is provided the strategies will be executed in order.
       *
       * @param {string|StrategyFunction|array} strategy The sanitization strategy / strategies which should be used. Either a name of an existing strategy, a custom strategy function, or an array consisting of multiple names and / or custom functions.
       */
      useStrategy: (function (self) {
        return function (strategy) {
          self.useStrategy(strategy);
        };
      })(this),

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translateSanitization#sanitize
       * @methodOf pascalprecht.translate.$translateSanitization
       *
       * @description
       * Sanitizes a value.
       *
       * @param {string|object} value The value which should be sanitized.
       * @param {string} mode The current sanitization mode, either 'params' or 'text'.
       * @param {string|StrategyFunction|array} [strategy] Optional custom strategy which should be used instead of the currently selected strategy.
       * @returns {string|object} sanitized value
       */
      sanitize: function (value, mode, strategy) {
        if (!currentStrategy) {
          showNoStrategyConfiguredWarning();
        }

        if (arguments.length < 3) {
          strategy = currentStrategy;
        }

        if (!strategy) {
          return value;
        }

        var selectedStrategies = angular.isArray(strategy) ? strategy : [strategy];
        return applyStrategies(value, mode, selectedStrategies);
      }
    };
  }];

  var htmlEscapeValue = function (value) {
    var element = angular.element('<div></div>');
    element.text(value); // not chainable, see #1044
    return element.html();
  };

  var htmlSanitizeValue = function (value) {
    if (!$sanitize) {
      throw new Error('pascalprecht.translate.$translateSanitization: Error cannot find $sanitize service. Either include the ngSanitize module (https://docs.angularjs.org/api/ngSanitize) or use a sanitization strategy which does not depend on $sanitize, such as \'escape\'.');
    }
    return $sanitize(value);
  };

  var mapInterpolationParameters = function (value, iteratee) {
    if (angular.isObject(value)) {
      var result = angular.isArray(value) ? [] : {};

      angular.forEach(value, function (propertyValue, propertyKey) {
        result[propertyKey] = mapInterpolationParameters(propertyValue, iteratee);
      });

      return result;
    } else if (angular.isNumber(value)) {
      return value;
    } else {
      return iteratee(value);
    }
  };
}

/**
 * @ngdoc object
 * @name pascalprecht.translate.$translateProvider
 * @description
 *
 * $translateProvider allows developers to register translation-tables, asynchronous loaders
 * and similar to configure translation behavior directly inside of a module.
 *
 */
angular.module('pascalprecht.translate')
.constant('pascalprechtTranslateOverrider', {})
.provider('$translate', $translate);

function $translate($STORAGE_KEY, $windowProvider, $translateSanitizationProvider, pascalprechtTranslateOverrider) {

  'use strict';

  var $translationTable = {},
      $preferredLanguage,
      $availableLanguageKeys = [],
      $languageKeyAliases,
      $fallbackLanguage,
      $fallbackWasString,
      $uses,
      $nextLang,
      $storageFactory,
      $storageKey = $STORAGE_KEY,
      $storagePrefix,
      $missingTranslationHandlerFactory,
      $interpolationFactory,
      $interpolatorFactories = [],
      $loaderFactory,
      $cloakClassName = 'translate-cloak',
      $loaderOptions,
      $notFoundIndicatorLeft,
      $notFoundIndicatorRight,
      $postCompilingEnabled = false,
      $forceAsyncReloadEnabled = false,
      NESTED_OBJECT_DELIMITER = '.',
      loaderCache,
      directivePriority = 0,
      statefulFilter = true,
      uniformLanguageTagResolver = 'default',
      languageTagResolver = {
        'default': function (tag) {
          return (tag || '').split('-').join('_');
        },
        java: function (tag) {
          var temp = (tag || '').split('-').join('_');
          var parts = temp.split('_');
          return parts.length > 1 ? (parts[0].toLowerCase() + '_' + parts[1].toUpperCase()) : temp;
        },
        bcp47: function (tag) {
          var temp = (tag || '').split('_').join('-');
          var parts = temp.split('-');
          return parts.length > 1 ? (parts[0].toLowerCase() + '-' + parts[1].toUpperCase()) : temp;
        }
      };

  var version = '2.7.2';

  // tries to determine the browsers language
  var getFirstBrowserLanguage = function () {

    // internal purpose only
    if (angular.isFunction(pascalprechtTranslateOverrider.getLocale)) {
      return pascalprechtTranslateOverrider.getLocale();
    }

    var nav = $windowProvider.$get().navigator,
        browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
        i,
        language;

    // support for HTML 5.1 "navigator.languages"
    if (angular.isArray(nav.languages)) {
      for (i = 0; i < nav.languages.length; i++) {
        language = nav.languages[i];
        if (language && language.length) {
          return language;
        }
      }
    }

    // support for other well known properties in browsers
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
      language = nav[browserLanguagePropertyKeys[i]];
      if (language && language.length) {
        return language;
      }
    }

    return null;
  };
  getFirstBrowserLanguage.displayName = 'angular-translate/service: getFirstBrowserLanguage';

  // tries to determine the browsers locale
  var getLocale = function () {
    var locale = getFirstBrowserLanguage() || '';
    if (languageTagResolver[uniformLanguageTagResolver]) {
      locale = languageTagResolver[uniformLanguageTagResolver](locale);
    }
    return locale;
  };
  getLocale.displayName = 'angular-translate/service: getLocale';

  /**
   * @name indexOf
   * @private
   *
   * @description
   * indexOf polyfill. Kinda sorta.
   *
   * @param {array} array Array to search in.
   * @param {string} searchElement Element to search for.
   *
   * @returns {int} Index of search element.
   */
  var indexOf = function(array, searchElement) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] === searchElement) {
        return i;
      }
    }
    return -1;
  };

  /**
   * @name trim
   * @private
   *
   * @description
   * trim polyfill
   *
   * @returns {string} The string stripped of whitespace from both ends
   */
  var trim = function() {
    return this.toString().replace(/^\s+|\s+$/g, '');
  };

  var negotiateLocale = function (preferred) {

    var avail = [],
        locale = angular.lowercase(preferred),
        i = 0,
        n = $availableLanguageKeys.length;

    for (; i < n; i++) {
      avail.push(angular.lowercase($availableLanguageKeys[i]));
    }

    if (indexOf(avail, locale) > -1) {
      return preferred;
    }

    if ($languageKeyAliases) {
      var alias;
      for (var langKeyAlias in $languageKeyAliases) {
        var hasWildcardKey = false;
        var hasExactKey = Object.prototype.hasOwnProperty.call($languageKeyAliases, langKeyAlias) &&
          angular.lowercase(langKeyAlias) === angular.lowercase(preferred);

        if (langKeyAlias.slice(-1) === '*') {
          hasWildcardKey = langKeyAlias.slice(0, -1) === preferred.slice(0, langKeyAlias.length-1);
        }
        if (hasExactKey || hasWildcardKey) {
          alias = $languageKeyAliases[langKeyAlias];
          if (indexOf(avail, angular.lowercase(alias)) > -1) {
            return alias;
          }
        }
      }
    }

    if (preferred) {
      var parts = preferred.split('_');

      if (parts.length > 1 && indexOf(avail, angular.lowercase(parts[0])) > -1) {
        return parts[0];
      }
    }

    // If everything fails, just return the preferred, unchanged.
    return preferred;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#translations
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Registers a new translation table for specific language key.
   *
   * To register a translation table for specific language, pass a defined language
   * key as first parameter.
   *
   * <pre>
   *  // register translation table for language: 'de_DE'
   *  $translateProvider.translations('de_DE', {
   *    'GREETING': 'Hallo Welt!'
   *  });
   *
   *  // register another one
   *  $translateProvider.translations('en_US', {
   *    'GREETING': 'Hello world!'
   *  });
   * </pre>
   *
   * When registering multiple translation tables for for the same language key,
   * the actual translation table gets extended. This allows you to define module
   * specific translation which only get added, once a specific module is loaded in
   * your app.
   *
   * Invoking this method with no arguments returns the translation table which was
   * registered with no language key. Invoking it with a language key returns the
   * related translation table.
   *
   * @param {string} key A language key.
   * @param {object} translationTable A plain old JavaScript object that represents a translation table.
   *
   */
  var translations = function (langKey, translationTable) {

    if (!langKey && !translationTable) {
      return $translationTable;
    }

    if (langKey && !translationTable) {
      if (angular.isString(langKey)) {
        return $translationTable[langKey];
      }
    } else {
      if (!angular.isObject($translationTable[langKey])) {
        $translationTable[langKey] = {};
      }
      angular.extend($translationTable[langKey], flatObject(translationTable));
    }
    return this;
  };

  this.translations = translations;

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#cloakClassName
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   *
   * Let's you change the class name for `translate-cloak` directive.
   * Default class name is `translate-cloak`.
   *
   * @param {string} name translate-cloak class name
   */
  this.cloakClassName = function (name) {
    if (!name) {
      return $cloakClassName;
    }
    $cloakClassName = name;
    return this;
  };

  /**
   * @name flatObject
   * @private
   *
   * @description
   * Flats an object. This function is used to flatten given translation data with
   * namespaces, so they are later accessible via dot notation.
   */
  var flatObject = function (data, path, result, prevKey) {
    var key, keyWithPath, keyWithShortPath, val;

    if (!path) {
      path = [];
    }
    if (!result) {
      result = {};
    }
    for (key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        continue;
      }
      val = data[key];
      if (angular.isObject(val)) {
        flatObject(val, path.concat(key), result, key);
      } else {
        keyWithPath = path.length ? ('' + path.join(NESTED_OBJECT_DELIMITER) + NESTED_OBJECT_DELIMITER + key) : key;
        if(path.length && key === prevKey){
          // Create shortcut path (foo.bar == foo.bar.bar)
          keyWithShortPath = '' + path.join(NESTED_OBJECT_DELIMITER);
          // Link it to original path
          result[keyWithShortPath] = '@:' + keyWithPath;
        }
        result[keyWithPath] = val;
      }
    }
    return result;
  };
  flatObject.displayName = 'flatObject';

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#addInterpolation
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Adds interpolation services to angular-translate, so it can manage them.
   *
   * @param {object} factory Interpolation service factory
   */
  this.addInterpolation = function (factory) {
    $interpolatorFactories.push(factory);
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useMessageFormatInterpolation
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use interpolation functionality of messageformat.js.
   * This is useful when having high level pluralization and gender selection.
   */
  this.useMessageFormatInterpolation = function () {
    return this.useInterpolation('$translateMessageFormatInterpolation');
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useInterpolation
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate which interpolation style to use as default, application-wide.
   * Simply pass a factory/service name. The interpolation service has to implement
   * the correct interface.
   *
   * @param {string} factory Interpolation service name.
   */
  this.useInterpolation = function (factory) {
    $interpolationFactory = factory;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useSanitizeStrategy
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Simply sets a sanitation strategy type.
   *
   * @param {string} value Strategy type.
   */
  this.useSanitizeValueStrategy = function (value) {
    $translateSanitizationProvider.useStrategy(value);
    return this;
  };

 /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#preferredLanguage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells the module which of the registered translation tables to use for translation
   * at initial startup by passing a language key. Similar to `$translateProvider#use`
   * only that it says which language to **prefer**.
   *
   * @param {string} langKey A language key.
   *
   */
  this.preferredLanguage = function(langKey) {
    setupPreferredLanguage(langKey);
    return this;

  };
  var setupPreferredLanguage = function (langKey) {
    if (langKey) {
      $preferredLanguage = langKey;
    }
    return $preferredLanguage;
  };
  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicator
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets an indicator which is used when a translation isn't found. E.g. when
   * setting the indicator as 'X' and one tries to translate a translation id
   * called `NOT_FOUND`, this will result in `X NOT_FOUND X`.
   *
   * Internally this methods sets a left indicator and a right indicator using
   * `$translateProvider.translationNotFoundIndicatorLeft()` and
   * `$translateProvider.translationNotFoundIndicatorRight()`.
   *
   * **Note**: These methods automatically add a whitespace between the indicators
   * and the translation id.
   *
   * @param {string} indicator An indicator, could be any string.
   */
  this.translationNotFoundIndicator = function (indicator) {
    this.translationNotFoundIndicatorLeft(indicator);
    this.translationNotFoundIndicatorRight(indicator);
    return this;
  };

  /**
   * ngdoc function
   * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicatorLeft
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets an indicator which is used when a translation isn't found left to the
   * translation id.
   *
   * @param {string} indicator An indicator.
   */
  this.translationNotFoundIndicatorLeft = function (indicator) {
    if (!indicator) {
      return $notFoundIndicatorLeft;
    }
    $notFoundIndicatorLeft = indicator;
    return this;
  };

  /**
   * ngdoc function
   * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicatorLeft
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets an indicator which is used when a translation isn't found right to the
   * translation id.
   *
   * @param {string} indicator An indicator.
   */
  this.translationNotFoundIndicatorRight = function (indicator) {
    if (!indicator) {
      return $notFoundIndicatorRight;
    }
    $notFoundIndicatorRight = indicator;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#fallbackLanguage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells the module which of the registered translation tables to use when missing translations
   * at initial startup by passing a language key. Similar to `$translateProvider#use`
   * only that it says which language to **fallback**.
   *
   * @param {string||array} langKey A language key.
   *
   */
  this.fallbackLanguage = function (langKey) {
    fallbackStack(langKey);
    return this;
  };

  var fallbackStack = function (langKey) {
    if (langKey) {
      if (angular.isString(langKey)) {
        $fallbackWasString = true;
        $fallbackLanguage = [ langKey ];
      } else if (angular.isArray(langKey)) {
        $fallbackWasString = false;
        $fallbackLanguage = langKey;
      }
      if (angular.isString($preferredLanguage)  && indexOf($fallbackLanguage, $preferredLanguage) < 0) {
        $fallbackLanguage.push($preferredLanguage);
      }

      return this;
    } else {
      if ($fallbackWasString) {
        return $fallbackLanguage[0];
      } else {
        return $fallbackLanguage;
      }
    }
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#use
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Set which translation table to use for translation by given language key. When
   * trying to 'use' a language which isn't provided, it'll throw an error.
   *
   * You actually don't have to use this method since `$translateProvider#preferredLanguage`
   * does the job too.
   *
   * @param {string} langKey A language key.
   */
  this.use = function (langKey) {
    if (langKey) {
      if (!$translationTable[langKey] && (!$loaderFactory)) {
        // only throw an error, when not loading translation data asynchronously
        throw new Error('$translateProvider couldn\'t find translationTable for langKey: \'' + langKey + '\'');
      }
      $uses = langKey;
      return this;
    }
    return $uses;
  };

 /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#storageKey
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells the module which key must represent the choosed language by a user in the storage.
   *
   * @param {string} key A key for the storage.
   */
  var storageKey = function(key) {
    if (!key) {
      if ($storagePrefix) {
        return $storagePrefix + $storageKey;
      }
      return $storageKey;
    }
    $storageKey = key;
    return this;
  };

  this.storageKey = storageKey;

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useUrlLoader
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use `$translateUrlLoader` extension service as loader.
   *
   * @param {string} url Url
   * @param {Object=} options Optional configuration object
   */
  this.useUrlLoader = function (url, options) {
    return this.useLoader('$translateUrlLoader', angular.extend({ url: url }, options));
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useStaticFilesLoader
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use `$translateStaticFilesLoader` extension service as loader.
   *
   * @param {Object=} options Optional configuration object
   */
  this.useStaticFilesLoader = function (options) {
    return this.useLoader('$translateStaticFilesLoader', options);
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useLoader
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use any other service as loader.
   *
   * @param {string} loaderFactory Factory name to use
   * @param {Object=} options Optional configuration object
   */
  this.useLoader = function (loaderFactory, options) {
    $loaderFactory = loaderFactory;
    $loaderOptions = options || {};
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useLocalStorage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use `$translateLocalStorage` service as storage layer.
   *
   */
  this.useLocalStorage = function () {
    return this.useStorage('$translateLocalStorage');
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useCookieStorage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use `$translateCookieStorage` service as storage layer.
   */
  this.useCookieStorage = function () {
    return this.useStorage('$translateCookieStorage');
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useStorage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use custom service as storage layer.
   */
  this.useStorage = function (storageFactory) {
    $storageFactory = storageFactory;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#storagePrefix
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets prefix for storage key.
   *
   * @param {string} prefix Storage key prefix
   */
  this.storagePrefix = function (prefix) {
    if (!prefix) {
      return prefix;
    }
    $storagePrefix = prefix;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useMissingTranslationHandlerLog
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use built-in log handler when trying to translate
   * a translation Id which doesn't exist.
   *
   * This is actually a shortcut method for `useMissingTranslationHandler()`.
   *
   */
  this.useMissingTranslationHandlerLog = function () {
    return this.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useMissingTranslationHandler
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Expects a factory name which later gets instantiated with `$injector`.
   * This method can be used to tell angular-translate to use a custom
   * missingTranslationHandler. Just build a factory which returns a function
   * and expects a translation id as argument.
   *
   * Example:
   * <pre>
   *  app.config(function ($translateProvider) {
   *    $translateProvider.useMissingTranslationHandler('customHandler');
   *  });
   *
   *  app.factory('customHandler', function (dep1, dep2) {
   *    return function (translationId) {
   *      // something with translationId and dep1 and dep2
   *    };
   *  });
   * </pre>
   *
   * @param {string} factory Factory name
   */
  this.useMissingTranslationHandler = function (factory) {
    $missingTranslationHandlerFactory = factory;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#usePostCompiling
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * If post compiling is enabled, all translated values will be processed
   * again with AngularJS' $compile.
   *
   * Example:
   * <pre>
   *  app.config(function ($translateProvider) {
   *    $translateProvider.usePostCompiling(true);
   *  });
   * </pre>
   *
   * @param {string} factory Factory name
   */
  this.usePostCompiling = function (value) {
    $postCompilingEnabled = !(!value);
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#forceAsyncReload
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * If force async reload is enabled, async loader will always be called
   * even if $translationTable already contains the language key, adding
   * possible new entries to the $translationTable.
   *
   * Example:
   * <pre>
   *  app.config(function ($translateProvider) {
   *    $translateProvider.forceAsyncReload(true);
   *  });
   * </pre>
   *
   * @param {boolean} value - valid values are true or false
   */
  this.forceAsyncReload = function (value) {
    $forceAsyncReloadEnabled = !(!value);
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#uniformLanguageTag
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate which language tag should be used as a result when determining
   * the current browser language.
   *
   * This setting must be set before invoking {@link pascalprecht.translate.$translateProvider#methods_determinePreferredLanguage determinePreferredLanguage()}.
   *
   * <pre>
   * $translateProvider
   *   .uniformLanguageTag('bcp47')
   *   .determinePreferredLanguage()
   * </pre>
   *
   * The resolver currently supports:
   * * default
   *     (traditionally: hyphens will be converted into underscores, i.e. en-US => en_US)
   *     en-US => en_US
   *     en_US => en_US
   *     en-us => en_us
   * * java
   *     like default, but the second part will be always in uppercase
   *     en-US => en_US
   *     en_US => en_US
   *     en-us => en_US
   * * BCP 47 (RFC 4646 & 4647)
   *     en-US => en-US
   *     en_US => en-US
   *     en-us => en-US
   *
   * See also:
   * * http://en.wikipedia.org/wiki/IETF_language_tag
   * * http://www.w3.org/International/core/langtags/
   * * http://tools.ietf.org/html/bcp47
   *
   * @param {string|object} options - options (or standard)
   * @param {string} options.standard - valid values are 'default', 'bcp47', 'java'
   */
  this.uniformLanguageTag = function (options) {

    if (!options) {
      options = {};
    } else if (angular.isString(options)) {
      options = {
        standard: options
      };
    }

    uniformLanguageTagResolver = options.standard;

    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#determinePreferredLanguage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to try to determine on its own which language key
   * to set as preferred language. When `fn` is given, angular-translate uses it
   * to determine a language key, otherwise it uses the built-in `getLocale()`
   * method.
   *
   * The `getLocale()` returns a language key in the format `[lang]_[country]` or
   * `[lang]` depending on what the browser provides.
   *
   * Use this method at your own risk, since not all browsers return a valid
   * locale (see {@link pascalprecht.translate.$translateProvider#methods_uniformLanguageTag uniformLanguageTag()}).
   *
   * @param {Function=} fn Function to determine a browser's locale
   */
  this.determinePreferredLanguage = function (fn) {

    var locale = (fn && angular.isFunction(fn)) ? fn() : getLocale();

    if (!$availableLanguageKeys.length) {
      $preferredLanguage = locale;
    } else {
      $preferredLanguage = negotiateLocale(locale);
    }

    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#registerAvailableLanguageKeys
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Registers a set of language keys the app will work with. Use this method in
   * combination with
   * {@link pascalprecht.translate.$translateProvider#determinePreferredLanguage determinePreferredLanguage}.
   * When available languages keys are registered, angular-translate
   * tries to find the best fitting language key depending on the browsers locale,
   * considering your language key convention.
   *
   * @param {object} languageKeys Array of language keys the your app will use
   * @param {object=} aliases Alias map.
   */
  this.registerAvailableLanguageKeys = function (languageKeys, aliases) {
    if (languageKeys) {
      $availableLanguageKeys = languageKeys;
      if (aliases) {
        $languageKeyAliases = aliases;
      }
      return this;
    }
    return $availableLanguageKeys;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useLoaderCache
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Registers a cache for internal $http based loaders.
   * {@link pascalprecht.translate.$translateProvider#determinePreferredLanguage determinePreferredLanguage}.
   * When false the cache will be disabled (default). When true or undefined
   * the cache will be a default (see $cacheFactory). When an object it will
   * be treat as a cache object itself: the usage is $http({cache: cache})
   *
   * @param {object} cache boolean, string or cache-object
   */
  this.useLoaderCache = function (cache) {
    if (cache === false) {
      // disable cache
      loaderCache = undefined;
    } else if (cache === true) {
      // enable cache using AJS defaults
      loaderCache = true;
    } else if (typeof(cache) === 'undefined') {
      // enable cache using default
      loaderCache = '$translationCache';
    } else if (cache) {
      // enable cache using given one (see $cacheFactory)
      loaderCache = cache;
    }
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#directivePriority
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets the default priority of the translate directive. The standard value is `0`.
   * Calling this function without an argument will return the current value.
   *
   * @param {number} priority for the translate-directive
   */
  this.directivePriority = function (priority) {
    if (priority === undefined) {
      // getter
      return directivePriority;
    } else {
      // setter with chaining
      directivePriority = priority;
      return this;
    }
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#statefulFilter
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Since AngularJS 1.3, filters which are not stateless (depending at the scope)
   * have to explicit define this behavior.
   * Sets whether the translate filter should be stateful or stateless. The standard value is `true`
   * meaning being stateful.
   * Calling this function without an argument will return the current value.
   *
   * @param {boolean} state - defines the state of the filter
   */
  this.statefulFilter = function (state) {
    if (state === undefined) {
      // getter
      return statefulFilter;
    } else {
      // setter with chaining
      statefulFilter = state;
      return this;
    }
  };

  /**
   * @ngdoc object
   * @name pascalprecht.translate.$translate
   * @requires $interpolate
   * @requires $log
   * @requires $rootScope
   * @requires $q
   *
   * @description
   * The `$translate` service is the actual core of angular-translate. It expects a translation id
   * and optional interpolate parameters to translate contents.
   *
   * <pre>
   *  $translate('HEADLINE_TEXT').then(function (translation) {
   *    $scope.translatedText = translation;
   *  });
   * </pre>
   *
   * @param {string|array} translationId A token which represents a translation id
   *                                     This can be optionally an array of translation ids which
   *                                     results that the function returns an object where each key
   *                                     is the translation id and the value the translation.
   * @param {object=} interpolateParams An object hash for dynamic values
   * @param {string} interpolationId The id of the interpolation to use
   * @returns {object} promise
   */
  this.$get = [
    '$log',
    '$injector',
    '$rootScope',
    '$q',
    function ($log, $injector, $rootScope, $q) {

      var Storage,
          defaultInterpolator = $injector.get($interpolationFactory || '$translateDefaultInterpolation'),
          pendingLoader = false,
          interpolatorHashMap = {},
          langPromises = {},
          fallbackIndex,
          startFallbackIteration;

      var $translate = function (translationId, interpolateParams, interpolationId, defaultTranslationText) {

        // Duck detection: If the first argument is an array, a bunch of translations was requested.
        // The result is an object.
        if (angular.isArray(translationId)) {
          // Inspired by Q.allSettled by Kris Kowal
          // https://github.com/kriskowal/q/blob/b0fa72980717dc202ffc3cbf03b936e10ebbb9d7/q.js#L1553-1563
          // This transforms all promises regardless resolved or rejected
          var translateAll = function (translationIds) {
            var results = {}; // storing the actual results
            var promises = []; // promises to wait for
            // Wraps the promise a) being always resolved and b) storing the link id->value
            var translate = function (translationId) {
              var deferred = $q.defer();
              var regardless = function (value) {
                results[translationId] = value;
                deferred.resolve([translationId, value]);
              };
              // we don't care whether the promise was resolved or rejected; just store the values
              $translate(translationId, interpolateParams, interpolationId, defaultTranslationText).then(regardless, regardless);
              return deferred.promise;
            };
            for (var i = 0, c = translationIds.length; i < c; i++) {
              promises.push(translate(translationIds[i]));
            }
            // wait for all (including storing to results)
            return $q.all(promises).then(function () {
              // return the results
              return results;
            });
          };
          return translateAll(translationId);
        }

        var deferred = $q.defer();

        // trim off any whitespace
        if (translationId) {
          translationId = trim.apply(translationId);
        }

        var promiseToWaitFor = (function () {
          var promise = $preferredLanguage ?
            langPromises[$preferredLanguage] :
            langPromises[$uses];

          fallbackIndex = 0;

          if ($storageFactory && !promise) {
            // looks like there's no pending promise for $preferredLanguage or
            // $uses. Maybe there's one pending for a language that comes from
            // storage.
            var langKey = Storage.get($storageKey);
            promise = langPromises[langKey];

            if ($fallbackLanguage && $fallbackLanguage.length) {
                var index = indexOf($fallbackLanguage, langKey);
                // maybe the language from storage is also defined as fallback language
                // we increase the fallback language index to not search in that language
                // as fallback, since it's probably the first used language
                // in that case the index starts after the first element
                fallbackIndex = (index === 0) ? 1 : 0;

                // but we can make sure to ALWAYS fallback to preferred language at least
                if (indexOf($fallbackLanguage, $preferredLanguage) < 0) {
                  $fallbackLanguage.push($preferredLanguage);
                }
            }
          }
          return promise;
        }());

        if (!promiseToWaitFor) {
          // no promise to wait for? okay. Then there's no loader registered
          // nor is a one pending for language that comes from storage.
          // We can just translate.
          determineTranslation(translationId, interpolateParams, interpolationId, defaultTranslationText).then(deferred.resolve, deferred.reject);
        } else {
          var promiseResolved = function () {
            determineTranslation(translationId, interpolateParams, interpolationId, defaultTranslationText).then(deferred.resolve, deferred.reject);
          };
          promiseResolved.displayName = 'promiseResolved';

          promiseToWaitFor['finally'](promiseResolved, deferred.reject);
        }
        return deferred.promise;
      };

      /**
       * @name applyNotFoundIndicators
       * @private
       *
       * @description
       * Applies not fount indicators to given translation id, if needed.
       * This function gets only executed, if a translation id doesn't exist,
       * which is why a translation id is expected as argument.
       *
       * @param {string} translationId Translation id.
       * @returns {string} Same as given translation id but applied with not found
       * indicators.
       */
      var applyNotFoundIndicators = function (translationId) {
        // applying notFoundIndicators
        if ($notFoundIndicatorLeft) {
          translationId = [$notFoundIndicatorLeft, translationId].join(' ');
        }
        if ($notFoundIndicatorRight) {
          translationId = [translationId, $notFoundIndicatorRight].join(' ');
        }
        return translationId;
      };

      /**
       * @name useLanguage
       * @private
       *
       * @description
       * Makes actual use of a language by setting a given language key as used
       * language and informs registered interpolators to also use the given
       * key as locale.
       *
       * @param {key} Locale key.
       */
      var useLanguage = function (key) {
        $uses = key;
        $rootScope.$emit('$translateChangeSuccess', {language: key});

        if ($storageFactory) {
          Storage.put($translate.storageKey(), $uses);
        }
        // inform default interpolator
        defaultInterpolator.setLocale($uses);

        var eachInterpolator = function (interpolator, id) {
          interpolatorHashMap[id].setLocale($uses);
        };
        eachInterpolator.displayName = 'eachInterpolatorLocaleSetter';

        // inform all others too!
        angular.forEach(interpolatorHashMap, eachInterpolator);
        $rootScope.$emit('$translateChangeEnd', {language: key});
      };

      /**
       * @name loadAsync
       * @private
       *
       * @description
       * Kicks of registered async loader using `$injector` and applies existing
       * loader options. When resolved, it updates translation tables accordingly
       * or rejects with given language key.
       *
       * @param {string} key Language key.
       * @return {Promise} A promise.
       */
      var loadAsync = function (key) {
        if (!key) {
          throw 'No language key specified for loading.';
        }

        var deferred = $q.defer();

        $rootScope.$emit('$translateLoadingStart', {language: key});
        pendingLoader = true;

        var cache = loaderCache;
        if (typeof(cache) === 'string') {
          // getting on-demand instance of loader
          cache = $injector.get(cache);
        }

        var loaderOptions = angular.extend({}, $loaderOptions, {
          key: key,
          $http: angular.extend({}, {
            cache: cache
          }, $loaderOptions.$http)
        });

        var onLoaderSuccess = function (data) {
          var translationTable = {};
          $rootScope.$emit('$translateLoadingSuccess', {language: key});

          if (angular.isArray(data)) {
            angular.forEach(data, function (table) {
              angular.extend(translationTable, flatObject(table));
            });
          } else {
            angular.extend(translationTable, flatObject(data));
          }
          pendingLoader = false;
          deferred.resolve({
            key: key,
            table: translationTable
          });
          $rootScope.$emit('$translateLoadingEnd', {language: key});
        };
        onLoaderSuccess.displayName = 'onLoaderSuccess';

        var onLoaderError = function (key) {
          $rootScope.$emit('$translateLoadingError', {language: key});
          deferred.reject(key);
          $rootScope.$emit('$translateLoadingEnd', {language: key});
        };
        onLoaderError.displayName = 'onLoaderError';

        $injector.get($loaderFactory)(loaderOptions)
          .then(onLoaderSuccess, onLoaderError);

        return deferred.promise;
      };

      if ($storageFactory) {
        Storage = $injector.get($storageFactory);

        if (!Storage.get || !Storage.put) {
          throw new Error('Couldn\'t use storage \'' + $storageFactory + '\', missing get() or put() method!');
        }
      }

      // if we have additional interpolations that were added via
      // $translateProvider.addInterpolation(), we have to map'em
      if ($interpolatorFactories.length) {
        var eachInterpolationFactory = function (interpolatorFactory) {
          var interpolator = $injector.get(interpolatorFactory);
          // setting initial locale for each interpolation service
          interpolator.setLocale($preferredLanguage || $uses);
          // make'em recognizable through id
          interpolatorHashMap[interpolator.getInterpolationIdentifier()] = interpolator;
        };
        eachInterpolationFactory.displayName = 'interpolationFactoryAdder';

        angular.forEach($interpolatorFactories, eachInterpolationFactory);
      }

      /**
       * @name getTranslationTable
       * @private
       *
       * @description
       * Returns a promise that resolves to the translation table
       * or is rejected if an error occurred.
       *
       * @param langKey
       * @returns {Q.promise}
       */
      var getTranslationTable = function (langKey) {
        var deferred = $q.defer();
        if (Object.prototype.hasOwnProperty.call($translationTable, langKey)) {
          deferred.resolve($translationTable[langKey]);
        } else if (langPromises[langKey]) {
          var onResolve = function (data) {
            translations(data.key, data.table);
            deferred.resolve(data.table);
          };
          onResolve.displayName = 'translationTableResolver';
          langPromises[langKey].then(onResolve, deferred.reject);
        } else {
          deferred.reject();
        }
        return deferred.promise;
      };

      /**
       * @name getFallbackTranslation
       * @private
       *
       * @description
       * Returns a promise that will resolve to the translation
       * or be rejected if no translation was found for the language.
       * This function is currently only used for fallback language translation.
       *
       * @param langKey The language to translate to.
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {Q.promise}
       */
      var getFallbackTranslation = function (langKey, translationId, interpolateParams, Interpolator) {
        var deferred = $q.defer();

        var onResolve = function (translationTable) {
          if (Object.prototype.hasOwnProperty.call(translationTable, translationId)) {
            Interpolator.setLocale(langKey);
            var translation = translationTable[translationId];
            if (translation.substr(0, 2) === '@:') {
              getFallbackTranslation(langKey, translation.substr(2), interpolateParams, Interpolator)
                .then(deferred.resolve, deferred.reject);
            } else {
              deferred.resolve(Interpolator.interpolate(translationTable[translationId], interpolateParams));
            }
            Interpolator.setLocale($uses);
          } else {
            deferred.reject();
          }
        };
        onResolve.displayName = 'fallbackTranslationResolver';

        getTranslationTable(langKey).then(onResolve, deferred.reject);

        return deferred.promise;
      };

      /**
       * @name getFallbackTranslationInstant
       * @private
       *
       * @description
       * Returns a translation
       * This function is currently only used for fallback language translation.
       *
       * @param langKey The language to translate to.
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {string} translation
       */
      var getFallbackTranslationInstant = function (langKey, translationId, interpolateParams, Interpolator) {
        var result, translationTable = $translationTable[langKey];

        if (translationTable && Object.prototype.hasOwnProperty.call(translationTable, translationId)) {
          Interpolator.setLocale(langKey);
          result = Interpolator.interpolate(translationTable[translationId], interpolateParams);
          if (result.substr(0, 2) === '@:') {
            return getFallbackTranslationInstant(langKey, result.substr(2), interpolateParams, Interpolator);
          }
          Interpolator.setLocale($uses);
        }

        return result;
      };


      /**
       * @name translateByHandler
       * @private
       *
       * Translate by missing translation handler.
       *
       * @param translationId
       * @returns translation created by $missingTranslationHandler or translationId is $missingTranslationHandler is
       * absent
       */
      var translateByHandler = function (translationId, interpolateParams) {
        // If we have a handler factory - we might also call it here to determine if it provides
        // a default text for a translationid that can't be found anywhere in our tables
        if ($missingTranslationHandlerFactory) {
          var resultString = $injector.get($missingTranslationHandlerFactory)(translationId, $uses, interpolateParams);
          if (resultString !== undefined) {
            return resultString;
          } else {
            return translationId;
          }
        } else {
          return translationId;
        }
      };

      /**
       * @name resolveForFallbackLanguage
       * @private
       *
       * Recursive helper function for fallbackTranslation that will sequentially look
       * for a translation in the fallbackLanguages starting with fallbackLanguageIndex.
       *
       * @param fallbackLanguageIndex
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {Q.promise} Promise that will resolve to the translation.
       */
      var resolveForFallbackLanguage = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator, defaultTranslationText) {
        var deferred = $q.defer();

        if (fallbackLanguageIndex < $fallbackLanguage.length) {
          var langKey = $fallbackLanguage[fallbackLanguageIndex];
          getFallbackTranslation(langKey, translationId, interpolateParams, Interpolator).then(
            deferred.resolve,
            function () {
              // Look in the next fallback language for a translation.
              // It delays the resolving by passing another promise to resolve.
              resolveForFallbackLanguage(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator, defaultTranslationText).then(deferred.resolve);
            }
          );
        } else {
          // No translation found in any fallback language
          // if a default translation text is set in the directive, then return this as a result
          if (defaultTranslationText) {
            deferred.resolve(defaultTranslationText);
          } else {
            // if no default translation is set and an error handler is defined, send it to the handler
            // and then return the result
            deferred.resolve(translateByHandler(translationId, interpolateParams));
          }
        }
        return deferred.promise;
      };

      /**
       * @name resolveForFallbackLanguageInstant
       * @private
       *
       * Recursive helper function for fallbackTranslation that will sequentially look
       * for a translation in the fallbackLanguages starting with fallbackLanguageIndex.
       *
       * @param fallbackLanguageIndex
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {string} translation
       */
      var resolveForFallbackLanguageInstant = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator) {
        var result;

        if (fallbackLanguageIndex < $fallbackLanguage.length) {
          var langKey = $fallbackLanguage[fallbackLanguageIndex];
          result = getFallbackTranslationInstant(langKey, translationId, interpolateParams, Interpolator);
          if (!result) {
            result = resolveForFallbackLanguageInstant(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator);
          }
        }
        return result;
      };

      /**
       * Translates with the usage of the fallback languages.
       *
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {Q.promise} Promise, that resolves to the translation.
       */
      var fallbackTranslation = function (translationId, interpolateParams, Interpolator, defaultTranslationText) {
        // Start with the fallbackLanguage with index 0
        return resolveForFallbackLanguage((startFallbackIteration>0 ? startFallbackIteration : fallbackIndex), translationId, interpolateParams, Interpolator, defaultTranslationText);
      };

      /**
       * Translates with the usage of the fallback languages.
       *
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {String} translation
       */
      var fallbackTranslationInstant = function (translationId, interpolateParams, Interpolator) {
        // Start with the fallbackLanguage with index 0
        return resolveForFallbackLanguageInstant((startFallbackIteration>0 ? startFallbackIteration : fallbackIndex), translationId, interpolateParams, Interpolator);
      };

      var determineTranslation = function (translationId, interpolateParams, interpolationId, defaultTranslationText) {

        var deferred = $q.defer();

        var table = $uses ? $translationTable[$uses] : $translationTable,
            Interpolator = (interpolationId) ? interpolatorHashMap[interpolationId] : defaultInterpolator;

        // if the translation id exists, we can just interpolate it
        if (table && Object.prototype.hasOwnProperty.call(table, translationId)) {
          var translation = table[translationId];

          // If using link, rerun $translate with linked translationId and return it
          if (translation.substr(0, 2) === '@:') {

            $translate(translation.substr(2), interpolateParams, interpolationId, defaultTranslationText)
              .then(deferred.resolve, deferred.reject);
          } else {
            deferred.resolve(Interpolator.interpolate(translation, interpolateParams));
          }
        } else {
          var missingTranslationHandlerTranslation;
          // for logging purposes only (as in $translateMissingTranslationHandlerLog), value is not returned to promise
          if ($missingTranslationHandlerFactory && !pendingLoader) {
            missingTranslationHandlerTranslation = translateByHandler(translationId, interpolateParams);
          }

          // since we couldn't translate the inital requested translation id,
          // we try it now with one or more fallback languages, if fallback language(s) is
          // configured.
          if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
            fallbackTranslation(translationId, interpolateParams, Interpolator, defaultTranslationText)
                .then(function (translation) {
                  deferred.resolve(translation);
                }, function (_translationId) {
                  deferred.reject(applyNotFoundIndicators(_translationId));
                });
          } else if ($missingTranslationHandlerFactory && !pendingLoader && missingTranslationHandlerTranslation) {
            // looks like the requested translation id doesn't exists.
            // Now, if there is a registered handler for missing translations and no
            // asyncLoader is pending, we execute the handler
            if (defaultTranslationText) {
              deferred.resolve(defaultTranslationText);
              } else {
                deferred.resolve(missingTranslationHandlerTranslation);
              }
          } else {
            if (defaultTranslationText) {
              deferred.resolve(defaultTranslationText);
            } else {
              deferred.reject(applyNotFoundIndicators(translationId));
            }
          }
        }
        return deferred.promise;
      };

      var determineTranslationInstant = function (translationId, interpolateParams, interpolationId) {

        var result, table = $uses ? $translationTable[$uses] : $translationTable,
            Interpolator = defaultInterpolator;

        // if the interpolation id exists use custom interpolator
        if (interpolatorHashMap && Object.prototype.hasOwnProperty.call(interpolatorHashMap, interpolationId)) {
          Interpolator = interpolatorHashMap[interpolationId];
        }

        // if the translation id exists, we can just interpolate it
        if (table && Object.prototype.hasOwnProperty.call(table, translationId)) {
          var translation = table[translationId];

          // If using link, rerun $translate with linked translationId and return it
          if (translation.substr(0, 2) === '@:') {
            result = determineTranslationInstant(translation.substr(2), interpolateParams, interpolationId);
          } else {
            result = Interpolator.interpolate(translation, interpolateParams);
          }
        } else {
          var missingTranslationHandlerTranslation;
          // for logging purposes only (as in $translateMissingTranslationHandlerLog), value is not returned to promise
          if ($missingTranslationHandlerFactory && !pendingLoader) {
            missingTranslationHandlerTranslation = translateByHandler(translationId, interpolateParams);
          }

          // since we couldn't translate the inital requested translation id,
          // we try it now with one or more fallback languages, if fallback language(s) is
          // configured.
          if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
            fallbackIndex = 0;
            result = fallbackTranslationInstant(translationId, interpolateParams, Interpolator);
          } else if ($missingTranslationHandlerFactory && !pendingLoader && missingTranslationHandlerTranslation) {
            // looks like the requested translation id doesn't exists.
            // Now, if there is a registered handler for missing translations and no
            // asyncLoader is pending, we execute the handler
            result = missingTranslationHandlerTranslation;
          } else {
            result = applyNotFoundIndicators(translationId);
          }
        }

        return result;
      };

      var clearNextLangAndPromise = function(key) {
        if ($nextLang === key) {
          $nextLang = undefined;
        }
        langPromises[key] = undefined;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#preferredLanguage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the language key for the preferred language.
       *
       * @param {string} langKey language String or Array to be used as preferredLanguage (changing at runtime)
       *
       * @return {string} preferred language key
       */
      $translate.preferredLanguage = function (langKey) {
        if(langKey) {
          setupPreferredLanguage(langKey);
        }
        return $preferredLanguage;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#cloakClassName
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the configured class name for `translate-cloak` directive.
       *
       * @return {string} cloakClassName
       */
      $translate.cloakClassName = function () {
        return $cloakClassName;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#fallbackLanguage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the language key for the fallback languages or sets a new fallback stack.
       *
       * @param {string=} langKey language String or Array of fallback languages to be used (to change stack at runtime)
       *
       * @return {string||array} fallback language key
       */
      $translate.fallbackLanguage = function (langKey) {
        if (langKey !== undefined && langKey !== null) {
          fallbackStack(langKey);

          // as we might have an async loader initiated and a new translation language might have been defined
          // we need to add the promise to the stack also. So - iterate.
          if ($loaderFactory) {
            if ($fallbackLanguage && $fallbackLanguage.length) {
              for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
                if (!langPromises[$fallbackLanguage[i]]) {
                  langPromises[$fallbackLanguage[i]] = loadAsync($fallbackLanguage[i]);
                }
              }
            }
          }
          $translate.use($translate.use());
        }
        if ($fallbackWasString) {
          return $fallbackLanguage[0];
        } else {
          return $fallbackLanguage;
        }

      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#useFallbackLanguage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Sets the first key of the fallback language stack to be used for translation.
       * Therefore all languages in the fallback array BEFORE this key will be skipped!
       *
       * @param {string=} langKey Contains the langKey the iteration shall start with. Set to false if you want to
       * get back to the whole stack
       */
      $translate.useFallbackLanguage = function (langKey) {
        if (langKey !== undefined && langKey !== null) {
          if (!langKey) {
            startFallbackIteration = 0;
          } else {
            var langKeyPosition = indexOf($fallbackLanguage, langKey);
            if (langKeyPosition > -1) {
              startFallbackIteration = langKeyPosition;
            }
          }

        }

      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#proposedLanguage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the language key of language that is currently loaded asynchronously.
       *
       * @return {string} language key
       */
      $translate.proposedLanguage = function () {
        return $nextLang;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#storage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns registered storage.
       *
       * @return {object} Storage
       */
      $translate.storage = function () {
        return Storage;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#use
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Tells angular-translate which language to use by given language key. This method is
       * used to change language at runtime. It also takes care of storing the language
       * key in a configured store to let your app remember the choosed language.
       *
       * When trying to 'use' a language which isn't available it tries to load it
       * asynchronously with registered loaders.
       *
       * Returns promise object with loaded language file data
       * @example
       * $translate.use("en_US").then(function(data){
       *   $scope.text = $translate("HELLO");
       * });
       *
       * @param {string} key Language key
       * @return {string} Language key
       */
      $translate.use = function (key) {
        if (!key) {
          return $uses;
        }

        var deferred = $q.defer();

        $rootScope.$emit('$translateChangeStart', {language: key});

        // Try to get the aliased language key
        var aliasedKey = negotiateLocale(key);
        if (aliasedKey) {
          key = aliasedKey;
        }

        // if there isn't a translation table for the language we've requested,
        // we load it asynchronously
        if (($forceAsyncReloadEnabled || !$translationTable[key]) && $loaderFactory && !langPromises[key]) {
          $nextLang = key;
          langPromises[key] = loadAsync(key).then(function (translation) {
            translations(translation.key, translation.table);
            deferred.resolve(translation.key);
            useLanguage(translation.key);
            return translation;
          }, function (key) {
            $rootScope.$emit('$translateChangeError', {language: key});
            deferred.reject(key);
            $rootScope.$emit('$translateChangeEnd', {language: key});
            return $q.reject(key);
          });
          langPromises[key]['finally'](function () {
            clearNextLangAndPromise(key);
          });
        } else if ($nextLang === key && langPromises[key]) {
          // we are already loading this asynchronously
          // resolve our new deferred when the old langPromise is resolved
          langPromises[key].then(function (translation) {
            deferred.resolve(translation.key);
            return translation;
          }, function (key) {
            deferred.reject(key);
            return $q.reject(key);
          });
        } else {
          deferred.resolve(key);
          useLanguage(key);
        }

        return deferred.promise;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#storageKey
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the key for the storage.
       *
       * @return {string} storage key
       */
      $translate.storageKey = function () {
        return storageKey();
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#isPostCompilingEnabled
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns whether post compiling is enabled or not
       *
       * @return {bool} storage key
       */
      $translate.isPostCompilingEnabled = function () {
        return $postCompilingEnabled;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#isForceAsyncReloadEnabled
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns whether force async reload is enabled or not
       *
       * @return {boolean} forceAsyncReload value
       */
      $translate.isForceAsyncReloadEnabled = function () {
        return $forceAsyncReloadEnabled;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#refresh
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Refreshes a translation table pointed by the given langKey. If langKey is not specified,
       * the module will drop all existent translation tables and load new version of those which
       * are currently in use.
       *
       * Refresh means that the module will drop target translation table and try to load it again.
       *
       * In case there are no loaders registered the refresh() method will throw an Error.
       *
       * If the module is able to refresh translation tables refresh() method will broadcast
       * $translateRefreshStart and $translateRefreshEnd events.
       *
       * @example
       * // this will drop all currently existent translation tables and reload those which are
       * // currently in use
       * $translate.refresh();
       * // this will refresh a translation table for the en_US language
       * $translate.refresh('en_US');
       *
       * @param {string} langKey A language key of the table, which has to be refreshed
       *
       * @return {promise} Promise, which will be resolved in case a translation tables refreshing
       * process is finished successfully, and reject if not.
       */
      $translate.refresh = function (langKey) {
        if (!$loaderFactory) {
          throw new Error('Couldn\'t refresh translation table, no loader registered!');
        }

        var deferred = $q.defer();

        function resolve() {
          deferred.resolve();
          $rootScope.$emit('$translateRefreshEnd', {language: langKey});
        }

        function reject() {
          deferred.reject();
          $rootScope.$emit('$translateRefreshEnd', {language: langKey});
        }

        $rootScope.$emit('$translateRefreshStart', {language: langKey});

        if (!langKey) {
          // if there's no language key specified we refresh ALL THE THINGS!
          var tables = [], loadingKeys = {};

          // reload registered fallback languages
          if ($fallbackLanguage && $fallbackLanguage.length) {
            for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
              tables.push(loadAsync($fallbackLanguage[i]));
              loadingKeys[$fallbackLanguage[i]] = true;
            }
          }

          // reload currently used language
          if ($uses && !loadingKeys[$uses]) {
            tables.push(loadAsync($uses));
          }

          var allTranslationsLoaded = function (tableData) {
            $translationTable = {};
            angular.forEach(tableData, function (data) {
              translations(data.key, data.table);
            });
            if ($uses) {
              useLanguage($uses);
            }
            resolve();
          };
          allTranslationsLoaded.displayName = 'refreshPostProcessor';

          $q.all(tables).then(allTranslationsLoaded, reject);

        } else if ($translationTable[langKey]) {

          var oneTranslationsLoaded = function (data) {
            translations(data.key, data.table);
            if (langKey === $uses) {
              useLanguage($uses);
            }
            resolve();
          };
          oneTranslationsLoaded.displayName = 'refreshPostProcessor';

          loadAsync(langKey).then(oneTranslationsLoaded, reject);

        } else {
          reject();
        }
        return deferred.promise;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#instant
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns a translation instantly from the internal state of loaded translation. All rules
       * regarding the current language, the preferred language of even fallback languages will be
       * used except any promise handling. If a language was not found, an asynchronous loading
       * will be invoked in the background.
       *
       * @param {string|array} translationId A token which represents a translation id
       *                                     This can be optionally an array of translation ids which
       *                                     results that the function's promise returns an object where
       *                                     each key is the translation id and the value the translation.
       * @param {object} interpolateParams Params
       * @param {string} interpolationId The id of the interpolation to use
       *
       * @return {string|object} translation
       */
      $translate.instant = function (translationId, interpolateParams, interpolationId) {

        // Detect undefined and null values to shorten the execution and prevent exceptions
        if (translationId === null || angular.isUndefined(translationId)) {
          return translationId;
        }

        // Duck detection: If the first argument is an array, a bunch of translations was requested.
        // The result is an object.
        if (angular.isArray(translationId)) {
          var results = {};
          for (var i = 0, c = translationId.length; i < c; i++) {
            results[translationId[i]] = $translate.instant(translationId[i], interpolateParams, interpolationId);
          }
          return results;
        }

        // We discarded unacceptable values. So we just need to verify if translationId is empty String
        if (angular.isString(translationId) && translationId.length < 1) {
          return translationId;
        }

        // trim off any whitespace
        if (translationId) {
          translationId = trim.apply(translationId);
        }

        var result, possibleLangKeys = [];
        if ($preferredLanguage) {
          possibleLangKeys.push($preferredLanguage);
        }
        if ($uses) {
          possibleLangKeys.push($uses);
        }
        if ($fallbackLanguage && $fallbackLanguage.length) {
          possibleLangKeys = possibleLangKeys.concat($fallbackLanguage);
        }
        for (var j = 0, d = possibleLangKeys.length; j < d; j++) {
          var possibleLangKey = possibleLangKeys[j];
          if ($translationTable[possibleLangKey]) {
            if (typeof $translationTable[possibleLangKey][translationId] !== 'undefined') {
              result = determineTranslationInstant(translationId, interpolateParams, interpolationId);
            } else if ($notFoundIndicatorLeft || $notFoundIndicatorRight) {
              result = applyNotFoundIndicators(translationId);
            }
          }
          if (typeof result !== 'undefined') {
            break;
          }
        }

        if (!result && result !== '') {
          // Return translation of default interpolator if not found anything.
          result = defaultInterpolator.interpolate(translationId, interpolateParams);
          if ($missingTranslationHandlerFactory && !pendingLoader) {
            result = translateByHandler(translationId, interpolateParams);
          }
        }

        return result;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#versionInfo
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the current version information for the angular-translate library
       *
       * @return {string} angular-translate version
       */
      $translate.versionInfo = function () {
        return version;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#loaderCache
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the defined loaderCache.
       *
       * @return {boolean|string|object} current value of loaderCache
       */
      $translate.loaderCache = function () {
        return loaderCache;
      };

      // internal purpose only
      $translate.directivePriority = function () {
        return directivePriority;
      };

      // internal purpose only
      $translate.statefulFilter = function () {
        return statefulFilter;
      };

      if ($loaderFactory) {

        // If at least one async loader is defined and there are no
        // (default) translations available we should try to load them.
        if (angular.equals($translationTable, {})) {
          $translate.use($translate.use());
        }

        // Also, if there are any fallback language registered, we start
        // loading them asynchronously as soon as we can.
        if ($fallbackLanguage && $fallbackLanguage.length) {
          var processAsyncResult = function (translation) {
            translations(translation.key, translation.table);
            $rootScope.$emit('$translateChangeEnd', { language: translation.key });
            return translation;
          };
          for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
            var fallbackLanguageId = $fallbackLanguage[i];
            if ($forceAsyncReloadEnabled || !$translationTable[fallbackLanguageId]) {
              langPromises[fallbackLanguageId] = loadAsync(fallbackLanguageId).then(processAsyncResult);
            }
          }
        }
      }

      return $translate;
    }
  ];
}
$translate.$inject = ['$STORAGE_KEY', '$windowProvider', '$translateSanitizationProvider', 'pascalprechtTranslateOverrider'];

$translate.displayName = 'displayName';

/**
 * @ngdoc object
 * @name pascalprecht.translate.$translateDefaultInterpolation
 * @requires $interpolate
 *
 * @description
 * Uses angular's `$interpolate` services to interpolate strings against some values.
 *
 * Be aware to configure a proper sanitization strategy.
 *
 * See also:
 * * {@link pascalprecht.translate.$translateSanitization}
 *
 * @return {object} $translateDefaultInterpolation Interpolator service
 */
angular.module('pascalprecht.translate').factory('$translateDefaultInterpolation', $translateDefaultInterpolation);

function $translateDefaultInterpolation ($interpolate, $translateSanitization) {

  'use strict';

  var $translateInterpolator = {},
      $locale,
      $identifier = 'default';

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateDefaultInterpolation#setLocale
   * @methodOf pascalprecht.translate.$translateDefaultInterpolation
   *
   * @description
   * Sets current locale (this is currently not use in this interpolation).
   *
   * @param {string} locale Language key or locale.
   */
  $translateInterpolator.setLocale = function (locale) {
    $locale = locale;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateDefaultInterpolation#getInterpolationIdentifier
   * @methodOf pascalprecht.translate.$translateDefaultInterpolation
   *
   * @description
   * Returns an identifier for this interpolation service.
   *
   * @returns {string} $identifier
   */
  $translateInterpolator.getInterpolationIdentifier = function () {
    return $identifier;
  };

  /**
   * @deprecated will be removed in 3.0
   * @see {@link pascalprecht.translate.$translateSanitization}
   */
  $translateInterpolator.useSanitizeValueStrategy = function (value) {
    $translateSanitization.useStrategy(value);
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateDefaultInterpolation#interpolate
   * @methodOf pascalprecht.translate.$translateDefaultInterpolation
   *
   * @description
   * Interpolates given string agains given interpolate params using angulars
   * `$interpolate` service.
   *
   * @returns {string} interpolated string.
   */
  $translateInterpolator.interpolate = function (string, interpolationParams) {
    interpolationParams = interpolationParams || {};
    interpolationParams = $translateSanitization.sanitize(interpolationParams, 'params');

    var interpolatedText = $interpolate(string)(interpolationParams);
    interpolatedText = $translateSanitization.sanitize(interpolatedText, 'text');

    return interpolatedText;
  };

  return $translateInterpolator;
}
$translateDefaultInterpolation.$inject = ['$interpolate', '$translateSanitization'];

$translateDefaultInterpolation.displayName = '$translateDefaultInterpolation';

angular.module('pascalprecht.translate').constant('$STORAGE_KEY', 'NG_TRANSLATE_LANG_KEY');

angular.module('pascalprecht.translate')
/**
 * @ngdoc directive
 * @name pascalprecht.translate.directive:translate
 * @requires $compile
 * @requires $filter
 * @requires $interpolate
 * @restrict A
 *
 * @description
 * Translates given translation id either through attribute or DOM content.
 * Internally it uses `translate` filter to translate translation id. It possible to
 * pass an optional `translate-values` object literal as string into translation id.
 *
 * @param {string=} translate Translation id which could be either string or interpolated string.
 * @param {string=} translate-values Values to pass into translation id. Can be passed as object literal string or interpolated object.
 * @param {string=} translate-attr-ATTR translate Translation id and put it into ATTR attribute.
 * @param {string=} translate-default will be used unless translation was successful
 * @param {boolean=} translate-compile (default true if present) defines locally activation of {@link pascalprecht.translate.$translateProvider#methods_usePostCompiling}
 *
 * @example
   <example module="ngView">
    <file name="index.html">
      <div ng-controller="TranslateCtrl">

        <pre translate="TRANSLATION_ID"></pre>
        <pre translate>TRANSLATION_ID</pre>
        <pre translate translate-attr-title="TRANSLATION_ID"></pre>
        <pre translate="{{translationId}}"></pre>
        <pre translate>{{translationId}}</pre>
        <pre translate="WITH_VALUES" translate-values="{value: 5}"></pre>
        <pre translate translate-values="{value: 5}">WITH_VALUES</pre>
        <pre translate="WITH_VALUES" translate-values="{{values}}"></pre>
        <pre translate translate-values="{{values}}">WITH_VALUES</pre>
        <pre translate translate-attr-title="WITH_VALUES" translate-values="{{values}}"></pre>

      </div>
    </file>
    <file name="script.js">
      angular.module('ngView', ['pascalprecht.translate'])

      .config(function ($translateProvider) {

        $translateProvider.translations('en',{
          'TRANSLATION_ID': 'Hello there!',
          'WITH_VALUES': 'The following value is dynamic: {{value}}'
        }).preferredLanguage('en');

      });

      angular.module('ngView').controller('TranslateCtrl', function ($scope) {
        $scope.translationId = 'TRANSLATION_ID';

        $scope.values = {
          value: 78
        };
      });
    </file>
    <file name="scenario.js">
      it('should translate', function () {
        inject(function ($rootScope, $compile) {
          $rootScope.translationId = 'TRANSLATION_ID';

          element = $compile('<p translate="TRANSLATION_ID"></p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate="{{translationId}}"></p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate>TRANSLATION_ID</p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate>{{translationId}}</p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate translate-attr-title="TRANSLATION_ID"></p>')($rootScope);
          $rootScope.$digest();
          expect(element.attr('title')).toBe('Hello there!');
        });
      });
    </file>
   </example>
 */
.directive('translate', translateDirective);
function translateDirective($translate, $q, $interpolate, $compile, $parse, $rootScope) {

  'use strict';

  /**
   * @name trim
   * @private
   *
   * @description
   * trim polyfill
   *
   * @returns {string} The string stripped of whitespace from both ends
   */
  var trim = function() {
    return this.toString().replace(/^\s+|\s+$/g, '');
  };

  return {
    restrict: 'AE',
    scope: true,
    priority: $translate.directivePriority(),
    compile: function (tElement, tAttr) {

      var translateValuesExist = (tAttr.translateValues) ?
        tAttr.translateValues : undefined;

      var translateInterpolation = (tAttr.translateInterpolation) ?
        tAttr.translateInterpolation : undefined;

      var translateValueExist = tElement[0].outerHTML.match(/translate-value-+/i);

      var interpolateRegExp = '^(.*)(' + $interpolate.startSymbol() + '.*' + $interpolate.endSymbol() + ')(.*)',
          watcherRegExp = '^(.*)' + $interpolate.startSymbol() + '(.*)' + $interpolate.endSymbol() + '(.*)';

      return function linkFn(scope, iElement, iAttr) {

        scope.interpolateParams = {};
        scope.preText = '';
        scope.postText = '';
        var translationIds = {};

        var initInterpolationParams = function (interpolateParams, iAttr, tAttr) {
          // initial setup
          if (iAttr.translateValues) {
            angular.extend(interpolateParams, $parse(iAttr.translateValues)(scope.$parent));
          }
          // initially fetch all attributes if existing and fill the params
          if (translateValueExist) {
            for (var attr in tAttr) {
              if (Object.prototype.hasOwnProperty.call(iAttr, attr) && attr.substr(0, 14) === 'translateValue' && attr !== 'translateValues') {
                var attributeName = angular.lowercase(attr.substr(14, 1)) + attr.substr(15);
                interpolateParams[attributeName] = tAttr[attr];
              }
            }
          }
        };

        // Ensures any change of the attribute "translate" containing the id will
        // be re-stored to the scope's "translationId".
        // If the attribute has no content, the element's text value (white spaces trimmed off) will be used.
        var observeElementTranslation = function (translationId) {

          // Remove any old watcher
          if (angular.isFunction(observeElementTranslation._unwatchOld)) {
            observeElementTranslation._unwatchOld();
            observeElementTranslation._unwatchOld = undefined;
          }

          if (angular.equals(translationId , '') || !angular.isDefined(translationId)) {
            // Resolve translation id by inner html if required
            var interpolateMatches = trim.apply(iElement.text()).match(interpolateRegExp);
            // Interpolate translation id if required
            if (angular.isArray(interpolateMatches)) {
              scope.preText = interpolateMatches[1];
              scope.postText = interpolateMatches[3];
              translationIds.translate = $interpolate(interpolateMatches[2])(scope.$parent);
              var watcherMatches = iElement.text().match(watcherRegExp);
              if (angular.isArray(watcherMatches) && watcherMatches[2] && watcherMatches[2].length) {
                observeElementTranslation._unwatchOld = scope.$watch(watcherMatches[2], function (newValue) {
                  translationIds.translate = newValue;
                  updateTranslations();
                });
              }
            } else {
              translationIds.translate = iElement.text().replace(/^\s+|\s+$/g,'');
            }
          } else {
            translationIds.translate = translationId;
          }
          updateTranslations();
        };

        var observeAttributeTranslation = function (translateAttr) {
          iAttr.$observe(translateAttr, function (translationId) {
            translationIds[translateAttr] = translationId;
            updateTranslations();
          });
        };

        // initial setup with values
        initInterpolationParams(scope.interpolateParams, iAttr, tAttr);

        var firstAttributeChangedEvent = true;
        iAttr.$observe('translate', function (translationId) {
          if (typeof translationId === 'undefined') {
            // case of element "<translate>xyz</translate>"
            observeElementTranslation('');
          } else {
            // case of regular attribute
            if (translationId !== '' || !firstAttributeChangedEvent) {
              translationIds.translate = translationId;
              updateTranslations();
            }
          }
          firstAttributeChangedEvent = false;
        });

        for (var translateAttr in iAttr) {
          if (iAttr.hasOwnProperty(translateAttr) && translateAttr.substr(0, 13) === 'translateAttr') {
            observeAttributeTranslation(translateAttr);
          }
        }

        iAttr.$observe('translateDefault', function (value) {
          scope.defaultText = value;
        });

        if (translateValuesExist) {
          iAttr.$observe('translateValues', function (interpolateParams) {
            if (interpolateParams) {
              scope.$parent.$watch(function () {
                angular.extend(scope.interpolateParams, $parse(interpolateParams)(scope.$parent));
              });
            }
          });
        }

        if (translateValueExist) {
          var observeValueAttribute = function (attrName) {
            iAttr.$observe(attrName, function (value) {
              var attributeName = angular.lowercase(attrName.substr(14, 1)) + attrName.substr(15);
              scope.interpolateParams[attributeName] = value;
            });
          };
          for (var attr in iAttr) {
            if (Object.prototype.hasOwnProperty.call(iAttr, attr) && attr.substr(0, 14) === 'translateValue' && attr !== 'translateValues') {
              observeValueAttribute(attr);
            }
          }
        }

        // Master update function
        var updateTranslations = function () {
          for (var key in translationIds) {

            if (translationIds.hasOwnProperty(key) && translationIds[key] !== undefined) {
              updateTranslation(key, translationIds[key], scope, scope.interpolateParams, scope.defaultText);
            }
          }
        };

        // Put translation processing function outside loop
        var updateTranslation = function(translateAttr, translationId, scope, interpolateParams, defaultTranslationText) {
          if (translationId) {
            $translate(translationId, interpolateParams, translateInterpolation, defaultTranslationText)
              .then(function (translation) {
                applyTranslation(translation, scope, true, translateAttr);
              }, function (translationId) {
                applyTranslation(translationId, scope, false, translateAttr);
              });
          } else {
            // as an empty string cannot be translated, we can solve this using successful=false
            applyTranslation(translationId, scope, false, translateAttr);
          }
        };

        var applyTranslation = function (value, scope, successful, translateAttr) {
          if (translateAttr === 'translate') {
            // default translate into innerHTML
            if (!successful && typeof scope.defaultText !== 'undefined') {
              value = scope.defaultText;
            }
            iElement.html(scope.preText + value + scope.postText);
            var globallyEnabled = $translate.isPostCompilingEnabled();
            var locallyDefined = typeof tAttr.translateCompile !== 'undefined';
            var locallyEnabled = locallyDefined && tAttr.translateCompile !== 'false';
            if ((globallyEnabled && !locallyDefined) || locallyEnabled) {
              $compile(iElement.contents())(scope);
            }
          } else {
            // translate attribute
            if (!successful && typeof scope.defaultText !== 'undefined') {
              value = scope.defaultText;
            }
            var attributeName = iAttr.$attr[translateAttr];
            if (attributeName.substr(0, 5) === 'data-') {
              // ensure html5 data prefix is stripped
              attributeName = attributeName.substr(5);
            }
            attributeName = attributeName.substr(15);
            iElement.attr(attributeName, value);
          }
        };

        if (translateValuesExist || translateValueExist || iAttr.translateDefault) {
          scope.$watch('interpolateParams', updateTranslations, true);
        }

        // Ensures the text will be refreshed after the current language was changed
        // w/ $translate.use(...)
        var unbind = $rootScope.$on('$translateChangeSuccess', updateTranslations);

        // ensure translation will be looked up at least one
        if (iElement.text().length) {
          if (iAttr.translate) {
            observeElementTranslation(iAttr.translate);
          } else {
            observeElementTranslation('');
          }
        } else if (iAttr.translate) {
          // ensure attribute will be not skipped
          observeElementTranslation(iAttr.translate);
        }
        updateTranslations();
        scope.$on('$destroy', unbind);
      };
    }
  };
}
translateDirective.$inject = ['$translate', '$q', '$interpolate', '$compile', '$parse', '$rootScope'];

translateDirective.displayName = 'translateDirective';

angular.module('pascalprecht.translate')
/**
 * @ngdoc directive
 * @name pascalprecht.translate.directive:translateCloak
 * @requires $rootScope
 * @requires $translate
 * @restrict A
 *
 * $description
 * Adds a `translate-cloak` class name to the given element where this directive
 * is applied initially and removes it, once a loader has finished loading.
 *
 * This directive can be used to prevent initial flickering when loading translation
 * data asynchronously.
 *
 * The class name is defined in
 * {@link pascalprecht.translate.$translateProvider#cloakClassName $translate.cloakClassName()}.
 *
 * @param {string=} translate-cloak If a translationId is provided, it will be used for showing
 *                                  or hiding the cloak. Basically it relies on the translation
 *                                  resolve.
 */
.directive('translateCloak', translateCloakDirective);

function translateCloakDirective($rootScope, $translate) {

  'use strict';

  return {
    compile: function (tElement) {
      var applyCloak = function () {
        tElement.addClass($translate.cloakClassName());
      },
      removeCloak = function () {
        tElement.removeClass($translate.cloakClassName());
      },
      removeListener = $rootScope.$on('$translateChangeEnd', function () {
        removeCloak();
        removeListener();
        removeListener = null;
      });
      applyCloak();

      return function linkFn(scope, iElement, iAttr) {
        // Register a watcher for the defined translation allowing a fine tuned cloak
        if (iAttr.translateCloak && iAttr.translateCloak.length) {
          iAttr.$observe('translateCloak', function (translationId) {
            $translate(translationId).then(removeCloak, applyCloak);
          });
        }
      };
    }
  };
}
translateCloakDirective.$inject = ['$rootScope', '$translate'];

translateCloakDirective.displayName = 'translateCloakDirective';

angular.module('pascalprecht.translate')
/**
 * @ngdoc filter
 * @name pascalprecht.translate.filter:translate
 * @requires $parse
 * @requires pascalprecht.translate.$translate
 * @function
 *
 * @description
 * Uses `$translate` service to translate contents. Accepts interpolate parameters
 * to pass dynamized values though translation.
 *
 * @param {string} translationId A translation id to be translated.
 * @param {*=} interpolateParams Optional object literal (as hash or string) to pass values into translation.
 *
 * @returns {string} Translated text.
 *
 * @example
   <example module="ngView">
    <file name="index.html">
      <div ng-controller="TranslateCtrl">

        <pre>{{ 'TRANSLATION_ID' | translate }}</pre>
        <pre>{{ translationId | translate }}</pre>
        <pre>{{ 'WITH_VALUES' | translate:'{value: 5}' }}</pre>
        <pre>{{ 'WITH_VALUES' | translate:values }}</pre>

      </div>
    </file>
    <file name="script.js">
      angular.module('ngView', ['pascalprecht.translate'])

      .config(function ($translateProvider) {

        $translateProvider.translations('en', {
          'TRANSLATION_ID': 'Hello there!',
          'WITH_VALUES': 'The following value is dynamic: {{value}}'
        });
        $translateProvider.preferredLanguage('en');

      });

      angular.module('ngView').controller('TranslateCtrl', function ($scope) {
        $scope.translationId = 'TRANSLATION_ID';

        $scope.values = {
          value: 78
        };
      });
    </file>
   </example>
 */
.filter('translate', translateFilterFactory);

function translateFilterFactory($parse, $translate) {

  'use strict';

  var translateFilter = function (translationId, interpolateParams, interpolation) {

    if (!angular.isObject(interpolateParams)) {
      interpolateParams = $parse(interpolateParams)(this);
    }

    return $translate.instant(translationId, interpolateParams, interpolation);
  };

  if ($translate.statefulFilter()) {
    translateFilter.$stateful = true;
  }

  return translateFilter;
}
translateFilterFactory.$inject = ['$parse', '$translate'];

translateFilterFactory.displayName = 'translateFilterFactory';

angular.module('pascalprecht.translate')

/**
 * @ngdoc object
 * @name pascalprecht.translate.$translationCache
 * @requires $cacheFactory
 *
 * @description
 * The first time a translation table is used, it is loaded in the translation cache for quick retrieval. You
 * can load translation tables directly into the cache by consuming the
 * `$translationCache` service directly.
 *
 * @return {object} $cacheFactory object.
 */
  .factory('$translationCache', $translationCache);

function $translationCache($cacheFactory) {

  'use strict';

  return $cacheFactory('translations');
}
$translationCache.$inject = ['$cacheFactory'];

$translationCache.displayName = '$translationCache';
return 'pascalprecht.translate';

}));

(function(exports, global) {
    global["eeh-navigation"] = exports;
    "use strict";
    angular.module("eehNavigation", [ "pascalprecht.translate" ]);
    "use strict";
    angular.module("eehNavigation").directive("eehNavigationActiveMenuItem", ActiveMenuItemDirective);
    function isMenuItemActive(menuItem, $state) {
        if (!menuItem.hasChildren()) {
            return angular.isDefined(menuItem.state) && $state.includes(menuItem.state);
        }
        var children = menuItem.children();
        for (var i = 0; i < children.length; i++) {
            if (angular.isDefined(children[i].state) && $state.includes(children[i].state)) {
                return true;
            }
            if (isMenuItemActive(children[i], $state)) {
                return true;
            }
        }
        return false;
    }
    function ActiveMenuItemDirective($state) {
        return {
            restrict: "A",
            scope: {
                menuItem: "=eehNavigationActiveMenuItem"
            },
            link: function(scope, element) {
                var checkIsActive = function() {
                    var isActive = isMenuItemActive(scope.menuItem, $state);
                    element.toggleClass("active", isActive);
                };
                scope.$on("$stateChangeSuccess", checkIsActive);
                checkIsActive();
            }
        };
    }
    ActiveMenuItemDirective.$inject = [ "$state" ];
    "use strict";
    var MenuItem = function(config) {
        this.weight = 0;
        angular.extend(this, config);
    };
    MenuItem.prototype.children = function() {
        var children = [];
        angular.forEach(this, function(property) {
            if (angular.isObject(property) && property instanceof MenuItem) {
                children.push(property);
            }
        });
        return children;
    };
    MenuItem.prototype.hasChildren = function() {
        return this.children().length > 0;
    };
    MenuItem.prototype._isVisible = function() {
        var hasVisibleChildren = this.children().filter(function(child) {
            return child._isVisible() !== false;
        }).length > 0;
        if (!hasVisibleChildren && angular.isUndefined(this.state) && angular.isUndefined(this.href) && angular.isUndefined(this.click) && !this.isDivider) {
            return false;
        }
        if (angular.isFunction(this.isVisible)) {
            return this.isVisible();
        }
        if (angular.isDefined(this.isVisible)) {
            return this.isVisible;
        }
        return true;
    };
    MenuItem.prototype.isVisible = function() {
        return true;
    };
    MenuItem.prototype.isHeavy = function() {
        if (this.hasOwnProperty("weight")) {
            return this.weight >= 0;
        }
    };
    "use strict";
    angular.module("eehNavigation").provider("eehNavigation", NavigationService);
    function NavigationService() {
        this._iconBaseClass = "glyphicon";
        this._defaultIconClassPrefix = "glyphicon";
        this._menuItems = {};
        this._toArray = function(items) {
            var arr = [];
            for (var key in items) {
                if (items.hasOwnProperty(key)) {
                    arr.push(items[key]);
                }
            }
            return arr;
        };
    }
    NavigationService.prototype.$get = function() {
        return this;
    };
    NavigationService.prototype.iconBaseClass = function(value) {
        if (angular.isUndefined(value)) {
            return this._iconBaseClass;
        }
        this._iconBaseClass = value;
        return this;
    };
    NavigationService.prototype.defaultIconClassPrefix = function(value) {
        if (angular.isUndefined(value)) {
            return this._defaultIconClassPrefix;
        }
        this._defaultIconClassPrefix = value;
        return this;
    };
    NavigationService.prototype.buildAncestorChain = function(name, items, config) {
        var keys = name.split(".");
        if (name.length === 0 || keys.length === 0) {
            return;
        }
        var key = keys.shift();
        if (angular.isUndefined(items[key])) {
            items[key] = keys.length === 0 ? config : {};
            if (keys.length === 0) {
                items[key] = config;
            }
        }
        this.buildAncestorChain(keys.join("."), items[key], config);
    };
    NavigationService.prototype.menuItemTree = function(menuName) {
        var items = {};
        var self = this;
        var menuItemsToTransform = {};
        if (angular.isDefined(menuName)) {
            var menuNameRegex = new RegExp("^" + menuName + ".");
            angular.forEach(this._menuItems, function(menuItem, menuItemName) {
                if (menuItemName.match(menuNameRegex) !== null) {
                    menuItemsToTransform[menuItemName.replace(menuNameRegex, "")] = menuItem;
                }
            });
        } else {
            menuItemsToTransform = this._menuItems;
        }
        angular.forEach(menuItemsToTransform, function(config, name) {
            self.buildAncestorChain(name, items, config);
        });
        return this._toArray(items);
    };
    NavigationService.prototype.menuItem = function(name, config) {
        if (angular.isUndefined(config)) {
            if (angular.isUndefined(this._menuItems[name])) {
                throw name + " is not a menu item";
            }
            return this._menuItems[name];
        }
        this._menuItems[name] = new MenuItem(config);
        return this;
    };
    NavigationService.prototype.menuItems = function() {
        return this._menuItems;
    };
    "use strict";
    angular.module("eehNavigation").directive("eehNavigationMenuItemContent", MenuItemContentDirective);
    function MenuItemContentDirective(eehNavigation) {
        return {
            restrict: "A",
            scope: {
                menuItem: "=eehNavigationMenuItemContent"
            },
            templateUrl: "template/eeh-navigation/menu-item-content/eeh-navigation-menu-item-content.html",
            link: function(scope) {
                scope.iconBaseClass = function() {
                    return eehNavigation.iconBaseClass();
                };
            }
        };
    }
    MenuItemContentDirective.$inject = [ "eehNavigation" ];
    "use strict";
    angular.module("eehNavigation").directive("eehNavigationMenu", MenuDirective);
    function MenuDirective(eehNavigation) {
        return {
            restrict: "AE",
            templateUrl: "template/eeh-navigation/menu/eeh-navigation-menu.html",
            scope: {
                menuName: "=",
                navClass: "=?",
                menuItemCollapsedIconClass: "=?",
                menuItemExpandedIconClass: "=?"
            },
            link: function(scope) {
                scope.iconBaseClass = function() {
                    return eehNavigation.iconBaseClass();
                };
                scope.defaultIconClassPrefix = function() {
                    return eehNavigation.defaultIconClassPrefix();
                };
                scope.navClass = scope.navClass || "navigation-menu";
                scope.menuItemCollapsedIconClass = scope.menuItemCollapsedIconClass || scope.defaultIconClassPrefix() + "-chevron-left";
                scope.menuItemExpandedIconClass = scope.menuItemExpandedIconClass || scope.defaultIconClassPrefix() + "-chevron-down";
                scope.$watch(eehNavigation.menuItems, function() {
                    if (angular.isUndefined(scope.menuName)) {
                        return;
                    }
                    scope.menuItems = eehNavigation.menuItemTree(scope.menuName);
                }, true);
            }
        };
    }
    MenuDirective.$inject = [ "eehNavigation" ];
    "use strict";
    angular.module("eehNavigation").directive("eehNavigationNavbarBrand", NavbarBrandDirective);
    function NavbarBrandDirective() {
        return {
            restrict: "AE",
            templateUrl: "template/eeh-navigation/navbar/eeh-navigation-navbar-brand.html",
            scope: {
                text: "=",
                state: "=",
                href: "=",
                target: "=",
                src: "=",
                click: "="
            }
        };
    }
    "use strict";
    var NavbarDirective = function($window, eehNavigation) {
        return {
            restrict: "AE",
            templateUrl: "template/eeh-navigation/navbar/eeh-navigation-navbar.html",
            scope: {
                menuName: "=",
                navClass: "=?",
                containerClass: "=?",
                brandText: "=",
                brandState: "=",
                brandHref: "=",
                brandTarget: "=",
                brandSrc: "=",
                brandClick: "="
            },
            link: function(scope) {
                scope.iconBaseClass = function() {
                    return eehNavigation.iconBaseClass();
                };
                scope.navClass = scope.navClass || "navbar-default navbar-static-top";
                scope.isNavbarCollapsed = true;
                scope.$watch(eehNavigation.menuItems, function() {
                    if (angular.isUndefined(scope.menuName)) {
                        return;
                    }
                    var menuItems = eehNavigation.menuItemTree(scope.menuName);
                    scope.leftNavbarMenuItems = menuItems.filter(function(item) {
                        return !item.isHeavy();
                    });
                    scope.rightNavbarMenuItems = menuItems.filter(function(item) {
                        return item.isHeavy();
                    });
                }, true);
                var windowElement = angular.element($window);
                windowElement.bind("resize", function() {
                    scope.$apply();
                });
                var getWindowDimensions = function() {
                    return {
                        innerHeight: windowElement[0].innerHeight,
                        innerWidth: windowElement[0].innerWidth
                    };
                };
                scope.$watch(getWindowDimensions, function(newValue) {
                    if (angular.isUndefined(newValue)) {
                        return;
                    }
                    var width = newValue.innerWidth > 0 ? newValue.innerWidth : $window.screen.width;
                    if (width >= 768) {
                        scope.isNavbarCollapsed = true;
                    }
                }, true);
            }
        };
    };
    angular.module("eehNavigation").directive("eehNavigationNavbar", [ "$window", "eehNavigation", NavbarDirective ]);
    "use strict";
    angular.module("eehNavigation").directive("eehNavigationSearchInput", SearchInputDirective);
    function SearchInputDirective(eehNavigation) {
        return {
            restrict: "AE",
            transclude: true,
            templateUrl: "template/eeh-navigation/search-input/eeh-navigation-search-input.html",
            scope: {
                iconClass: "=",
                submit: "=",
                classes: "=",
                isCollapsed: "="
            },
            link: function(scope) {
                scope.model = {
                    query: ""
                };
                scope.iconBaseClass = function() {
                    return eehNavigation.iconBaseClass();
                };
            }
        };
    }
    SearchInputDirective.$inject = [ "eehNavigation" ];
    "use strict";
    angular.module("eehNavigation").directive("eehNavigationSidebar", SidebarDirective);
    function SidebarDirective($window, eehNavigation) {
        return {
            restrict: "AE",
            transclude: true,
            templateUrl: "template/eeh-navigation/sidebar/eeh-navigation-sidebar.html",
            scope: {
                menuName: "=",
                navClass: "=?",
                topOffset: "=?",
                menuItemCollapsedIconClass: "=?",
                menuItemExpandedIconClass: "=?",
                sidebarCollapsedIconClass: "=?",
                sidebarExpandedIconClass: "=?",
                searchInputIconClass: "=?",
                searchInputIsVisible: "=?",
                searchInputSubmit: "=",
                sidebarCollapsedButtonIsVisible: "=?",
                sidebarIsCollapsed: "=?"
            },
            link: function(scope) {
                scope.iconBaseClass = function() {
                    return eehNavigation.iconBaseClass();
                };
                scope.defaultIconClassPrefix = function() {
                    return eehNavigation.defaultIconClassPrefix();
                };
                scope.topOffset = scope.topOffset || 51;
                scope.navClass = scope.navClass || "navbar-default";
                scope.menuItemCollapsedIconClass = scope.menuItemCollapsedIconClass || scope.defaultIconClassPrefix() + "-chevron-left";
                scope.menuItemExpandedIconClass = scope.menuItemExpandedIconClass || scope.defaultIconClassPrefix() + "-chevron-down";
                scope.sidebarCollapsedIconClass = scope.sidebarCollapsedIconClass || scope.defaultIconClassPrefix() + "-arrow-right";
                scope.sidebarExpandedIconClass = scope.sidebarExpandedIconClass || scope.defaultIconClassPrefix() + "-arrow-left";
                scope.searchInputIconClass = scope.searchInputIconClass || scope.defaultIconClassPrefix() + "-search";
                if (scope.sidebarCollapsedButtonIsVisible !== false) {
                    scope.sidebarCollapsedButtonIsVisible = true;
                }
                scope.sidebarIsCollapsed = scope.sidebarIsCollapsed || false;
                if (scope.searchInputIsVisible !== false) {
                    scope.searchInputIsVisible = true;
                }
                var menuItems = function() {
                    return eehNavigation.menuItems();
                };
                scope.$watch(menuItems, function() {
                    if (angular.isUndefined(scope.menuName)) {
                        return;
                    }
                    scope.sidebarMenuItems = eehNavigation.menuItemTree(scope.menuName);
                }, true);
                var windowElement = angular.element($window);
                windowElement.bind("resize", function() {
                    scope.$apply();
                });
                var getWindowDimensions = function() {
                    return {
                        innerHeight: windowElement[0].innerHeight,
                        innerWidth: windowElement[0].innerWidth
                    };
                };
                var transcludedWrapper = angular.element(document.querySelectorAll("#eeh-navigation-page-wrapper"));
                scope.$watch(getWindowDimensions, function(newValue) {
                    if (angular.isUndefined(newValue)) {
                        return;
                    }
                    var height = newValue.innerHeight > 0 ? newValue.innerHeight : $window.screen.height;
                    height = height - scope.topOffset;
                    if (height < 1) {
                        height = 1;
                    }
                    if (height > scope.topOffset) {
                        transcludedWrapper.css("min-height", height + "px");
                    }
                }, true);
                scope.toggleSidebarTextCollapse = function() {
                    scope.sidebarIsCollapsed = !scope.sidebarIsCollapsed;
                    setTextCollapseState();
                };
                function setTextCollapseState() {
                    var sidebarMenuItems = angular.element(document.querySelectorAll("ul.sidebar-nav:not(.sidebar-nav-nested) > li > a > span"));
                    var sidebarMenuItemText = sidebarMenuItems.find("span");
                    var allMenuItemTextElements = Array.prototype.filter.call(sidebarMenuItemText, function(item) {
                        return item.matches(".menu-item-text");
                    });
                    var arrowIconElements = Array.prototype.filter.call(sidebarMenuItems, function(item) {
                        return item.matches(".sidebar-arrow");
                    });
                    var sidebarElement = angular.element(document.querySelectorAll(".eeh-navigation-sidebar"));
                    if (scope.sidebarIsCollapsed) {
                        transcludedWrapper.addClass("sidebar-text-collapsed");
                        sidebarElement.addClass("sidebar-text-collapsed");
                        allMenuItemTextElements.forEach(function(menuItem) {
                            angular.element(menuItem).addClass("hidden");
                        });
                        arrowIconElements.forEach(function(menuItem) {
                            angular.element(menuItem).addClass("hidden");
                        });
                        angular.forEach(menuItems(), function(menuItem) {
                            menuItem.isCollapsed = true;
                        });
                    } else {
                        transcludedWrapper.removeClass("sidebar-text-collapsed");
                        sidebarElement.removeClass("sidebar-text-collapsed");
                        allMenuItemTextElements.forEach(function(menuItem) {
                            angular.element(menuItem).removeClass("hidden");
                        });
                        arrowIconElements.forEach(function(menuItem) {
                            angular.element(menuItem).removeClass("hidden");
                        });
                    }
                }
                scope.$on("$includeContentLoaded", function() {
                    setTextCollapseState();
                });
                scope.isSidebarVisible = function() {
                    return scope.searchInputIsVisible || angular.isArray(scope.sidebarMenuItems) && scope.sidebarMenuItems.filter(function(item) {
                        return item._isVisible();
                    }).length > 0;
                };
                scope.topLevelMenuItemClickHandler = function(clickedMenuItem) {
                    if (!scope.sidebarIsCollapsed || !clickedMenuItem.hasChildren()) {
                        return;
                    }
                    scope.sidebarMenuItems.filter(function(menuItem) {
                        return menuItem.hasChildren() && clickedMenuItem !== menuItem;
                    }).forEach(function(menuItem) {
                        menuItem.isCollapsed = true;
                    });
                };
            }
        };
    }
    SidebarDirective.$inject = [ "$window", "eehNavigation" ];
})({}, function() {
    return this;
}());
!function(a,b){b["eeh-navigation"]=a,angular.module("eehNavigation").run(["$templateCache",function(a){"use strict";a.put("template/eeh-navigation/menu-item-content/eeh-navigation-menu-item-content.html",'<span class="menu-item-icon icon-fw {{ iconBaseClass() }} {{ menuItem.iconClass}}"></span>\n<span class="menu-item-text"> {{ menuItem.text|translate }}</span>\n'),a.put("template/eeh-navigation/menu/eeh-navigation-menu.html",'<nav ng-class="navClass">\n    <ul>\n        <li ng-repeat="item in menuItems | orderBy:\'weight\'"\n            ng-include="\'template/eeh-navigation/list-menu-item.html\'"\n            ng-class="{ \'leaf\': !item.hasChildren() }"\n            ng-if="item._isVisible()"\n            eeh-navigation-active-menu-item="item"></li>\n    </ul>\n</nav>\n\n<script type="text/ng-template" id="template/eeh-navigation/list-menu-item.html">\n    <a ng-if="item.state" ui-sref="{{item.state}}">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="item.click" ng-click="item.click()">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="item.href" ng-href="{{item.href}}" target="{{item.target ? item.target : \'_self\'}}">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="!item.state && item.hasChildren()">\n        <span eeh-navigation-menu-item-content="item"></span>\n        <span class="float-right icon-fw {{ iconBaseClass() }}"\n              ng-class="item.isCollapsed ? menuItemCollapsedIconClass : menuItemExpandedIconClass"></span>\n    </a>\n    <ul ng-if="!item.state && item.hasChildren()">\n        <li ng-repeat="item in item.children()"\n            ng-include="\'template/eeh-navigation/list-menu-item.html\'"\n            ng-if="item._isVisible()"\n            eeh-navigation-active-menu-item="item"></li>\n    </ul>\n</script>\n'),a.put("template/eeh-navigation/navbar/eeh-navigation-navbar-brand.html",'<a ng-if="state && !href && (text || src)"\n   class="navbar-brand"\n   ng-click="click()"\n   ui-sref="{{ state }}">\n    <span ng-include="\'template/eeh-navigation/navbar-brand-content.html\'"></span>\n</a>\n\n<a ng-if="!state && href && (text || src)"\n   class="navbar-brand"\n   ng-click="click()"\n   ng-href="{{ href }}"\n   target="{{ target ? target : \'_self\'}}">\n    <span ng-include="\'template/eeh-navigation/navbar-brand-content.html\'"></span>\n</a>\n\n<span ng-if="!state && !href && (text || src)"\n      ng-click="click()"\n      class="navbar-brand">\n    <span ng-include="\'template/eeh-navigation/navbar-brand-content.html\'"></span>\n</span>\n\n<script type="text/ng-template" id="template/eeh-navigation/navbar-brand-content.html">\n    <img ng-if="src" ng-src="{{ src }}">\n    <span ng-if="text">{{ text|translate }}</span>\n</script>\n\n'),a.put("template/eeh-navigation/navbar/eeh-navigation-navbar.html",'<nav class="navbar eeh-navigation eeh-navigation-navbar"\n     ng-class="navClass"\n     role="navigation">\n    <div ng-class="containerClass">\n        <div class="navbar-header">\n            <button type="button" class="navbar-toggle" ng-click="isNavbarCollapsed = !isNavbarCollapsed">\n                <span class="sr-only">Toggle navigation</span>\n                <span class="icon-bar"></span>\n                <span class="icon-bar"></span>\n                <span class="icon-bar"></span>\n            </button>\n            <eeh-navigation-navbar-brand text="brandText"\n                                         state="brandState"\n                                         href="brandHref"\n                                         target="brandTarget"\n                                         src="brandSrc"\n                                         click="brandClick"></eeh-navigation-navbar-brand>\n        </div>\n        <div uib-collapse="isNavbarCollapsed" class="navbar-collapse">\n            <ul class="nav navbar-nav navbar-left">\n                <li ng-repeat="item in leftNavbarMenuItems | orderBy:\'weight\'"\n                    ng-include="\'template/eeh-navigation/navbar-menu-item.html\'"\n                    ng-if="item._isVisible()"\n                    uib-dropdown\n                    ui-sref-active-eq="active"\n                    eeh-navigation-active-menu-item="item"></li>\n            </ul>\n            <ul class="nav navbar-nav navbar-right">\n                <li ng-repeat="item in rightNavbarMenuItems | orderBy:\'weight\'"\n                    ng-include="\'template/eeh-navigation/navbar-menu-item.html\'"\n                    ng-if="item._isVisible()"\n                    uib-dropdown\n                    ui-sref-active-eq="active"\n                    eeh-navigation-active-menu-item="item"></li>\n            </ul>\n        </div>\n    </div>\n</nav>\n\n<script type="text/ng-template" id="template/eeh-navigation/navbar-menu-item.html">\n    <a ng-if="!item.isDivider && item.state" ui-sref="{{ item.state }}">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="item.click" ng-click="item.click()">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="item.href" ng-href="{{item.href}}" target="{{item.target ? item.target : \'_self\'}}">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="item.hasChildren()" uib-dropdown-toggle="">\n        <span class="icon-fw {{ iconBaseClass() }} {{ item.iconClass }}"></span>\n        <span> {{ item.text|translate }}</span>\n        <span class="caret"></span>\n    </a>\n    <ul ng-if="item.hasChildren()" class="dropdown-menu">\n        <li ng-repeat="item in item.children()|orderBy:\'weight\'"\n            ng-class="{\'divider\': item.isDivider}"\n            ng-include="\'template/eeh-navigation/navbar-menu-item.html\'"\n            ng-if="item._isVisible()"\n            ui-sref-active-eq="active"></li>\n    </ul>\n</script>\n'),a.put("template/eeh-navigation/search-input/eeh-navigation-search-input.html",'<div ng-include="\'template/eeh-navigation/search-input.html\'"\n     ng-if="!isCollapsed"\n     class="eeh-navigation-search-input"></div>\n\n<a class="eeh-navigation-search-input" ng-href="" ng-if="isCollapsed"\n   popover-placement="right"\n   popover-append-to-body="\'true\'"\n   uib-popover-template="\'template/eeh-navigation/search-input-popover.html\'">\n    <span class="menu-item-icon icon-fw {{ iconBaseClass() }} {{ iconClass }}"></span>\n</a>\n<script type="text/ng-template" id="template/eeh-navigation/search-input-popover.html">\n    <div class="row search-input-popover">\n        <div class="col-xs-12">\n            <div ng-include="\'template/eeh-navigation/search-input.html\'"></div>\n        </div>\n    </div>\n</script>\n\n<script type="text/ng-template" id="template/eeh-navigation/search-input.html">\n    <form ng-submit="submit(model.query)" class="navbar-form" ng-class="classes">\n        <div class="input-group">\n            <input type="text"\n                   class="form-control"\n                   placeholder="{{\'Search\'|translate}}"\n                   ng-model="model.query">\n        <span class="input-group-btn" ng-if="!isCollapsed">\n            <button class="btn btn-default">\n                <span class="icon-fw {{ iconBaseClass() }} {{ iconClass }}"></span>\n            </button>\n        </span>\n        </div>\n    </form>\n</script>\n'),a.put("template/eeh-navigation/sidebar/eeh-navigation-sidebar.html",'<nav class="navbar navbar-default eeh-navigation eeh-navigation-sidebar" role="navigation"\n    ng-class="navClass">\n    <div class="navbar-collapse" uib-collapse="isNavbarCollapsed">\n        <ul class="nav sidebar-nav">\n            <li class="sidebar-search" ng-if="searchInputIsVisible">\n                <eeh-navigation-search-input class="sidebar-search-input"\n                                             icon-class="searchInputIconClass"\n                                             submit="searchInputSubmit"\n                                             is-collapsed="sidebarIsCollapsed"></eeh-navigation-search-input>\n            </li>\n            <li ng-repeat="item in sidebarMenuItems | orderBy:\'weight\'"\n                ng-include="\'template/eeh-navigation/sidebar-menu-item.html\'"\n                ng-class="{ \'leaf\': !item.hasChildren() }"\n                ng-if="item._isVisible()"\n                ng-click="topLevelMenuItemClickHandler(item)"fire\n                ui-sref-active-eq="active"\n                eeh-navigation-active-menu-item="item"></li>\n            <li ng-click="toggleSidebarTextCollapse()" ng-if="sidebarCollapsedButtonIsVisible && isSidebarVisible()">\n                <a>\n                    <span class="icon-fw {{ iconBaseClass() }}" ng-class="sidebarIsCollapsed ? sidebarCollapsedIconClass : sidebarExpandedIconClass"></span>\n                </a>\n            </li>\n        </ul>\n    </div>\n</nav>\n\n<div id="eeh-navigation-page-wrapper" ng-class="{ \'sidebar-invisible\': !isSidebarVisible() }">\n    <div class="row">\n        <div class="col-lg-12">\n            <div ng-transclude></div>\n        </div>\n    </div>\n</div>\n\n<script type="text/ng-template" id="template/eeh-navigation/sidebar-menu-item.html">\n    <a ng-if="item.state" ui-sref="{{item.state}}">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="item.click" ng-click="item.click()">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="item.href" ng-href="{{item.href}}" target="{{item.target ? item.target : \'_self\'}}">\n        <span eeh-navigation-menu-item-content="item"></span>\n    </a>\n    <a ng-if="!item.state && item.hasChildren()"\n       ng-click="item.isCollapsed = !item.isCollapsed">\n        <span eeh-navigation-menu-item-content="item"></span>\n        <span class="navbar-right sidebar-arrow icon-fw {{ iconBaseClass() }}"\n              ng-class="item.isCollapsed ? menuItemCollapsedIconClass : menuItemExpandedIconClass"></span>\n    </a>\n    <ul ng-if="!item.state && item.hasChildren()" uib-collapse="item.isCollapsed"\n        ng-class="{ \'text-collapsed\': sidebarIsCollapsed }"\n        class="nav sidebar-nav sidebar-nav-nested">\n        <li ng-repeat="item in item.children()"\n            ng-include="\'template/eeh-navigation/sidebar-menu-item.html\'"\n            ng-class="{ \'leaf\': !item.hasChildren() }"\n            ng-if="item._isVisible()"\n            ui-sref-active-eq="active"\n            eeh-navigation-active-menu-item="item"></li>\n    </ul>\n</script>\n')}])}({},function(){return this}());
//# sourceMappingURL=eeh-navigation.tpl.min.js.map
/*!
 * ui-select
 * http://github.com/angular-ui/ui-select
 * Version: 0.16.0 - 2016-03-23T20:51:56.609Z
 * License: MIT
 */
!function(){"use strict";var e={TAB:9,ENTER:13,ESC:27,SPACE:32,LEFT:37,UP:38,RIGHT:39,DOWN:40,SHIFT:16,CTRL:17,ALT:18,PAGE_UP:33,PAGE_DOWN:34,HOME:36,END:35,BACKSPACE:8,DELETE:46,COMMAND:91,MAP:{91:"COMMAND",8:"BACKSPACE",9:"TAB",13:"ENTER",16:"SHIFT",17:"CTRL",18:"ALT",19:"PAUSEBREAK",20:"CAPSLOCK",27:"ESC",32:"SPACE",33:"PAGE_UP",34:"PAGE_DOWN",35:"END",36:"HOME",37:"LEFT",38:"UP",39:"RIGHT",40:"DOWN",43:"+",44:"PRINTSCREEN",45:"INSERT",46:"DELETE",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",59:";",61:"=",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NUMLOCK",145:"SCROLLLOCK",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},isControl:function(t){var s=t.which;switch(s){case e.COMMAND:case e.SHIFT:case e.CTRL:case e.ALT:return!0}return t.metaKey?!0:!1},isFunctionKey:function(e){return e=e.which?e.which:e,e>=112&&123>=e},isVerticalMovement:function(t){return~[e.UP,e.DOWN].indexOf(t)},isHorizontalMovement:function(t){return~[e.LEFT,e.RIGHT,e.BACKSPACE,e.DELETE].indexOf(t)},toSeparator:function(t){var s={ENTER:"\n",TAB:"	",SPACE:" "}[t];return s?s:e[t]?void 0:t}};void 0===angular.element.prototype.querySelectorAll&&(angular.element.prototype.querySelectorAll=function(e){return angular.element(this[0].querySelectorAll(e))}),void 0===angular.element.prototype.closest&&(angular.element.prototype.closest=function(e){for(var t=this[0],s=t.matches||t.webkitMatchesSelector||t.mozMatchesSelector||t.msMatchesSelector;t;){if(s.bind(t)(e))return t;t=t.parentElement}return!1});var t=0,s=angular.module("ui.select",[]).constant("uiSelectConfig",{theme:"bootstrap",searchEnabled:!0,sortable:!1,placeholder:"",refreshDelay:1e3,closeOnSelect:!0,skipFocusser:!1,dropdownPosition:"auto",generateId:function(){return t++},appendToBody:!1}).service("uiSelectMinErr",function(){var e=angular.$$minErr("ui.select");return function(){var t=e.apply(this,arguments),s=t.message.replace(new RegExp("\nhttp://errors.angularjs.org/.*"),"");return new Error(s)}}).directive("uisTranscludeAppend",function(){return{link:function(e,t,s,i,c){c(e,function(e){t.append(e)})}}}).filter("highlight",function(){function e(e){return(""+e).replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")}return function(t,s){return s&&t?(""+t).replace(new RegExp(e(s),"gi"),'<span class="ui-select-highlight">$&</span>'):t}}).factory("uisOffset",["$document","$window",function(e,t){return function(s){var i=s[0].getBoundingClientRect();return{width:i.width||s.prop("offsetWidth"),height:i.height||s.prop("offsetHeight"),top:i.top+(t.pageYOffset||e[0].documentElement.scrollTop),left:i.left+(t.pageXOffset||e[0].documentElement.scrollLeft)}}}]);s.directive("uiSelectChoices",["uiSelectConfig","uisRepeatParser","uiSelectMinErr","$compile","$window",function(e,t,s,i,c){return{restrict:"EA",require:"^uiSelect",replace:!0,transclude:!0,templateUrl:function(t){t.addClass("ui-select-choices");var s=t.parent().attr("theme")||e.theme;return s+"/choices.tpl.html"},compile:function(l,n){if(!n.repeat)throw s("repeat","Expected 'repeat' expression.");return function(l,n,a,r,o){var u=a.groupBy,d=a.groupFilter;if(r.parseRepeatAttr(a.repeat,u,d),r.disableChoiceExpression=a.uiDisableChoice,r.onHighlightCallback=a.onHighlight,r.dropdownPosition=a.position?a.position.toLowerCase():e.dropdownPosition,u){var p=n.querySelectorAll(".ui-select-choices-group");if(1!==p.length)throw s("rows","Expected 1 .ui-select-choices-group but got '{0}'.",p.length);p.attr("ng-repeat",t.getGroupNgRepeatExpression())}var g=n.querySelectorAll(".ui-select-choices-row");if(1!==g.length)throw s("rows","Expected 1 .ui-select-choices-row but got '{0}'.",g.length);g.attr("ng-repeat",r.parserResult.repeatExpression(u)).attr("ng-if","$select.open"),c.document.addEventListener&&g.attr("ng-mouseenter","$select.setActiveItem("+r.parserResult.itemName+")").attr("ng-click","$select.select("+r.parserResult.itemName+",$select.skipFocusser,$event)");var h=n.querySelectorAll(".ui-select-choices-row-inner");if(1!==h.length)throw s("rows","Expected 1 .ui-select-choices-row-inner but got '{0}'.",h.length);h.attr("uis-transclude-append",""),c.document.addEventListener||h.attr("ng-mouseenter","$select.setActiveItem("+r.parserResult.itemName+")").attr("ng-click","$select.select("+r.parserResult.itemName+",$select.skipFocusser,$event)"),i(n,o)(l),l.$watch("$select.search",function(e){e&&!r.open&&r.multiple&&r.activate(!1,!0),r.activeIndex=r.tagging.isActivated?-1:0,!a.minimumInputLength||r.search.length>=a.minimumInputLength?r.refresh(a.refresh):r.items=[]}),a.$observe("refreshDelay",function(){var t=l.$eval(a.refreshDelay);r.refreshDelay=void 0!==t?t:e.refreshDelay})}}}}]),s.controller("uiSelectCtrl",["$scope","$element","$timeout","$filter","uisRepeatParser","uiSelectMinErr","uiSelectConfig","$parse","$injector","$window",function(t,s,i,c,l,n,a,r,o,u){function d(e,t,s){if(e.findIndex)return e.findIndex(t,s);for(var i,c=Object(e),l=c.length>>>0,n=0;l>n;n++)if(i=c[n],t.call(s,i,n,c))return n;return-1}function p(){(v.resetSearchInput||void 0===v.resetSearchInput&&a.resetSearchInput)&&(v.search=m,v.selected&&v.items.length&&!v.multiple&&(v.activeIndex=d(v.items,function(e){return angular.equals(this,e)},v.selected)))}function g(e,t){var s,i,c=[];for(s=0;s<t.length;s++)for(i=0;i<e.length;i++)e[i].name==[t[s]]&&c.push(e[i]);return c}function h(t){var s=!0;switch(t){case e.DOWN:!v.open&&v.multiple?v.activate(!1,!0):v.activeIndex<v.items.length-1&&v.activeIndex++;break;case e.UP:!v.open&&v.multiple?v.activate(!1,!0):(v.activeIndex>0||0===v.search.length&&v.tagging.isActivated&&v.activeIndex>-1)&&v.activeIndex--;break;case e.TAB:(!v.multiple||v.open)&&v.select(v.items[v.activeIndex],!0);break;case e.ENTER:v.open&&(v.tagging.isActivated||v.activeIndex>=0)?v.select(v.items[v.activeIndex],v.skipFocusser):v.activate(!1,!0);break;case e.ESC:v.close();break;default:s=!1}return s}function f(){var e=s.querySelectorAll(".ui-select-choices-content"),t=e.querySelectorAll(".ui-select-choices-row");if(t.length<1)throw n("choices","Expected multiple .ui-select-choices-row but got '{0}'.",t.length);if(!(v.activeIndex<0)){var i=t[v.activeIndex],c=i.offsetTop+i.clientHeight-e[0].scrollTop,l=e[0].offsetHeight;c>l?e[0].scrollTop+=c-l:c<i.clientHeight&&(v.isGrouped&&0===v.activeIndex?e[0].scrollTop=0:e[0].scrollTop-=i.clientHeight-c)}}var v=this,m="";if(v.placeholder=a.placeholder,v.searchEnabled=a.searchEnabled,v.sortable=a.sortable,v.refreshDelay=a.refreshDelay,v.paste=a.paste,v.removeSelected=!1,v.closeOnSelect=!0,v.skipFocusser=!1,v.search=m,v.activeIndex=0,v.items=[],v.open=!1,v.focus=!1,v.disabled=!1,v.selected=void 0,v.dropdownPosition="auto",v.focusser=void 0,v.resetSearchInput=!0,v.multiple=void 0,v.disableChoiceExpression=void 0,v.tagging={isActivated:!1,fct:void 0},v.taggingTokens={isActivated:!1,tokens:void 0},v.lockChoiceExpression=void 0,v.clickTriggeredSelect=!1,v.$filter=c,v.$animate=function(){try{return o.get("$animate")}catch(e){return null}}(),v.searchInput=s.querySelectorAll("input.ui-select-search"),1!==v.searchInput.length)throw n("searchInput","Expected 1 input.ui-select-search but got '{0}'.",v.searchInput.length);v.isEmpty=function(){return angular.isUndefined(v.selected)||null===v.selected||""===v.selected||v.multiple&&0===v.selected.length},v.activate=function(e,c){if(!v.disabled&&!v.open){c||p(),t.$broadcast("uis:activate"),v.open=!0,v.activeIndex=v.activeIndex>=v.items.length?0:v.activeIndex,-1===v.activeIndex&&v.taggingLabel!==!1&&(v.activeIndex=0);var l=s.querySelectorAll(".ui-select-choices-content");v.$animate&&v.$animate.on&&v.$animate.enabled(l[0])?v.$animate.on("enter",l[0],function(t,s){"close"===s&&i(function(){v.focusSearchInput(e)})}):i(function(){v.focusSearchInput(e),!v.tagging.isActivated&&v.items.length>1&&f()})}},v.focusSearchInput=function(e){v.search=e||v.search,v.searchInput[0].focus()},v.findGroupByName=function(e){return v.groups&&v.groups.filter(function(t){return t.name===e})[0]},v.parseRepeatAttr=function(e,s,i){function c(e){var c=t.$eval(s);if(v.groups=[],angular.forEach(e,function(e){var t=angular.isFunction(c)?c(e):e[c],s=v.findGroupByName(t);s?s.items.push(e):v.groups.push({name:t,items:[e]})}),i){var l=t.$eval(i);angular.isFunction(l)?v.groups=l(v.groups):angular.isArray(l)&&(v.groups=g(v.groups,l))}v.items=[],v.groups.forEach(function(e){v.items=v.items.concat(e.items)})}function a(e){v.items=e}v.setItemsFn=s?c:a,v.parserResult=l.parse(e),v.isGrouped=!!s,v.itemProperty=v.parserResult.itemName;var o=v.parserResult.source,u=function(){var e=o(t);t.$uisSource=Object.keys(e).map(function(t){var s={};return s[v.parserResult.keyName]=t,s.value=e[t],s})};v.parserResult.keyName&&(u(),v.parserResult.source=r("$uisSource"+v.parserResult.filters),t.$watch(o,function(e,t){e!==t&&u()},!0)),v.refreshItems=function(e){e=e||v.parserResult.source(t);var s=v.selected;if(v.isEmpty()||angular.isArray(s)&&!s.length||!v.removeSelected)v.setItemsFn(e);else if(void 0!==e){var i=e.filter(function(e){return s.every(function(t){return!angular.equals(e,t)})});v.setItemsFn(i)}("auto"===v.dropdownPosition||"up"===v.dropdownPosition)&&t.calculateDropdownPos()},t.$watchCollection(v.parserResult.source,function(e){if(void 0===e||null===e)v.items=[];else{if(!angular.isArray(e))throw n("items","Expected an array but got '{0}'.",e);v.refreshItems(e),v.ngModel.$modelValue=null}})};var $;v.refresh=function(e){void 0!==e&&($&&i.cancel($),$=i(function(){t.$eval(e)},v.refreshDelay))},v.isActive=function(e){if(!v.open)return!1;var t=v.items.indexOf(e[v.itemProperty]),s=t==v.activeIndex;return!s||0>t&&v.taggingLabel!==!1||0>t&&v.taggingLabel===!1?!1:(s&&!angular.isUndefined(v.onHighlightCallback)&&e.$eval(v.onHighlightCallback),s)},v.isDisabled=function(e){if(v.open){var t,s=v.items.indexOf(e[v.itemProperty]),i=!1;return s>=0&&!angular.isUndefined(v.disableChoiceExpression)&&(t=v.items[s],i=!!e.$eval(v.disableChoiceExpression),t._uiSelectChoiceDisabled=i),i}},v.select=function(e,s,c){if(void 0===e||!e._uiSelectChoiceDisabled){if(!v.items&&!v.search&&!v.tagging.isActivated)return;if(!e||!e._uiSelectChoiceDisabled){if(v.tagging.isActivated){if(v.taggingLabel===!1)if(v.activeIndex<0){if(e=void 0!==v.tagging.fct?v.tagging.fct(v.search):v.search,!e||angular.equals(v.items[0],e))return}else e=v.items[v.activeIndex];else if(0===v.activeIndex){if(void 0===e)return;if(void 0!==v.tagging.fct&&"string"==typeof e){if(e=v.tagging.fct(e),!e)return}else"string"==typeof e&&(e=e.replace(v.taggingLabel,"").trim())}if(v.selected&&angular.isArray(v.selected)&&v.selected.filter(function(t){return angular.equals(t,e)}).length>0)return v.close(s),void 0}t.$broadcast("uis:select",e);var l={};l[v.parserResult.itemName]=e,i(function(){v.onSelectCallback(t,{$item:e,$model:v.parserResult.modelMapper(t,l)})}),v.closeOnSelect&&v.close(s),c&&"click"===c.type&&(v.clickTriggeredSelect=!0)}}},v.close=function(e){v.open&&(v.ngModel&&v.ngModel.$setTouched&&v.ngModel.$setTouched(),p(),v.open=!1,t.$broadcast("uis:close",e))},v.setFocus=function(){v.focus||v.focusInput[0].focus()},v.clear=function(e){v.select(void 0),e.stopPropagation(),i(function(){v.focusser[0].focus()},0,!1)},v.toggle=function(e){v.open?(v.close(),e.preventDefault(),e.stopPropagation()):v.activate()},v.isLocked=function(e,t){var s,i=v.selected[t];return i&&!angular.isUndefined(v.lockChoiceExpression)&&(s=!!e.$eval(v.lockChoiceExpression),i._uiSelectChoiceLocked=s),s};var b=null;v.sizeSearchInput=function(){var e=v.searchInput[0],s=v.searchInput.parent().parent()[0],c=function(){return s.clientWidth*!!e.offsetParent},l=function(t){if(0===t)return!1;var s=t-e.offsetLeft-10;return 50>s&&(s=t),v.searchInput.css("width",s+"px"),!0};v.searchInput.css("width","10px"),i(function(){null!==b||l(c())||(b=t.$watch(c,function(e){l(e)&&(b(),b=null)}))})},v.searchInput.on("keydown",function(s){var c=s.which;~[e.ENTER,e.ESC].indexOf(c)&&(s.preventDefault(),s.stopPropagation()),t.$apply(function(){var t=!1;if((v.items.length>0||v.tagging.isActivated)&&(h(c),v.taggingTokens.isActivated)){for(var l=0;l<v.taggingTokens.tokens.length;l++)v.taggingTokens.tokens[l]===e.MAP[s.keyCode]&&v.search.length>0&&(t=!0);t&&i(function(){v.searchInput.triggerHandler("tagged");var t=v.search.replace(e.MAP[s.keyCode],"").trim();v.tagging.fct&&(t=v.tagging.fct(t)),t&&v.select(t,!0)})}}),e.isVerticalMovement(c)&&v.items.length>0&&f(),(c===e.ENTER||c===e.ESC)&&(s.preventDefault(),s.stopPropagation())}),v.searchInput.on("paste",function(t){var s;if(s=window.clipboardData&&window.clipboardData.getData?window.clipboardData.getData("Text"):(t.originalEvent||t).clipboardData.getData("text/plain"),s=v.search+s,s&&s.length>0)if(v.taggingTokens.isActivated){var i=e.toSeparator(v.taggingTokens.tokens[0]),c=s.split(i||v.taggingTokens.tokens[0]);if(c&&c.length>0){var l=v.search;angular.forEach(c,function(e){var t=v.tagging.fct?v.tagging.fct(e):e;t&&v.select(t,!0)}),v.search=l||m,t.preventDefault(),t.stopPropagation()}}else v.paste&&(v.paste(s),v.search=m,t.preventDefault(),t.stopPropagation())}),v.searchInput.on("tagged",function(){i(function(){p()})}),t.$on("$destroy",function(){v.searchInput.off("keyup keydown tagged blur paste")}),angular.element(u).bind("resize",function(){v.sizeSearchInput()})}]),s.directive("uiSelect",["$document","uiSelectConfig","uiSelectMinErr","uisOffset","$compile","$parse","$timeout",function(e,t,s,i,c,l,n){return{restrict:"EA",templateUrl:function(e,s){var i=s.theme||t.theme;return i+(angular.isDefined(s.multiple)?"/select-multiple.tpl.html":"/select.tpl.html")},replace:!0,transclude:!0,require:["uiSelect","^ngModel"],scope:!0,controller:"uiSelectCtrl",controllerAs:"$select",compile:function(c,a){var r=/{(.*)}\s*{(.*)}/.exec(a.ngClass);if(r){var o="{"+r[1]+", "+r[2]+"}";a.ngClass=o,c.attr("ng-class",o)}return angular.isDefined(a.multiple)?c.append("<ui-select-multiple/>").removeAttr("multiple"):c.append("<ui-select-single/>"),a.inputId&&(c.querySelectorAll("input.ui-select-search")[0].id=a.inputId),function(c,a,r,o,u){function d(e){if(h.open){var t=!1;if(t=window.jQuery?window.jQuery.contains(a[0],e.target):a[0].contains(e.target),!t&&!h.clickTriggeredSelect){var s;if(h.skipFocusser)s=!0;else{var i=["input","button","textarea","select"],l=angular.element(e.target).controller("uiSelect");s=l&&l!==h,s||(s=~i.indexOf(e.target.tagName.toLowerCase()))}h.close(s),c.$digest()}h.clickTriggeredSelect=!1}}function p(){var t=i(a);m=angular.element('<div class="ui-select-placeholder"></div>'),m[0].style.width=t.width+"px",m[0].style.height=t.height+"px",a.after(m),$=a[0].style.width,e.find("body").append(a),a[0].style.position="absolute",a[0].style.left=t.left+"px",a[0].style.top=t.top+"px",a[0].style.width=t.width+"px"}function g(){null!==m&&(m.replaceWith(a),m=null,a[0].style.position="",a[0].style.left="",a[0].style.top="",a[0].style.width=$,h.setFocus())}var h=o[0],f=o[1];h.generatedId=t.generateId(),h.baseTitle=r.title||"Select box",h.focusserTitle=h.baseTitle+" focus",h.focusserId="focusser-"+h.generatedId,h.closeOnSelect=function(){return angular.isDefined(r.closeOnSelect)?l(r.closeOnSelect)():t.closeOnSelect}(),c.$watch("skipFocusser",function(){var e=c.$eval(r.skipFocusser);h.skipFocusser=void 0!==e?e:t.skipFocusser}),h.onSelectCallback=l(r.onSelect),h.onRemoveCallback=l(r.onRemove),h.limit=angular.isDefined(r.limit)?parseInt(r.limit,10):void 0,h.ngModel=f,h.choiceGrouped=function(e){return h.isGrouped&&e&&e.name},r.tabindex&&r.$observe("tabindex",function(e){h.focusInput.attr("tabindex",e),a.removeAttr("tabindex")}),c.$watch("searchEnabled",function(){var e=c.$eval(r.searchEnabled);h.searchEnabled=void 0!==e?e:t.searchEnabled}),c.$watch("sortable",function(){var e=c.$eval(r.sortable);h.sortable=void 0!==e?e:t.sortable}),r.$observe("disabled",function(){h.disabled=void 0!==r.disabled?r.disabled:!1}),r.$observe("resetSearchInput",function(){var e=c.$eval(r.resetSearchInput);h.resetSearchInput=void 0!==e?e:!0}),r.$observe("paste",function(){h.paste=c.$eval(r.paste)}),r.$observe("tagging",function(){if(void 0!==r.tagging){var e=c.$eval(r.tagging);h.tagging={isActivated:!0,fct:e!==!0?e:void 0}}else h.tagging={isActivated:!1,fct:void 0}}),r.$observe("taggingLabel",function(){void 0!==r.tagging&&(h.taggingLabel="false"===r.taggingLabel?!1:void 0!==r.taggingLabel?r.taggingLabel:"(new)")}),r.$observe("taggingTokens",function(){if(void 0!==r.tagging){var e=void 0!==r.taggingTokens?r.taggingTokens.split("|"):[",","ENTER"];h.taggingTokens={isActivated:!0,tokens:e}}}),angular.isDefined(r.autofocus)&&n(function(){h.setFocus()}),angular.isDefined(r.focusOn)&&c.$on(r.focusOn,function(){n(function(){h.setFocus()})}),e.on("click",d),c.$on("$destroy",function(){e.off("click",d)}),u(c,function(e){var t=angular.element("<div>").append(e),i=t.querySelectorAll(".ui-select-match");if(i.removeAttr("ui-select-match"),i.removeAttr("data-ui-select-match"),1!==i.length)throw s("transcluded","Expected 1 .ui-select-match but got '{0}'.",i.length);a.querySelectorAll(".ui-select-match").replaceWith(i);var c=t.querySelectorAll(".ui-select-choices");if(c.removeAttr("ui-select-choices"),c.removeAttr("data-ui-select-choices"),1!==c.length)throw s("transcluded","Expected 1 .ui-select-choices but got '{0}'.",c.length);a.querySelectorAll(".ui-select-choices").replaceWith(c)});var v=c.$eval(r.appendToBody);(void 0!==v?v:t.appendToBody)&&(c.$watch("$select.open",function(e){e?p():g()}),c.$on("$destroy",function(){g()}));var m=null,$="",b=null,w="direction-up";c.$watch("$select.open",function(){("auto"===h.dropdownPosition||"up"===h.dropdownPosition)&&c.calculateDropdownPos()});var x=function(e,t){e=e||i(a),t=t||i(b),b[0].style.position="absolute",b[0].style.top=-1*t.height+"px",a.addClass(w)},y=function(e,t){a.removeClass(w),e=e||i(a),t=t||i(b),b[0].style.position="",b[0].style.top=""};c.calculateDropdownPos=function(){if(h.open){if(b=angular.element(a).querySelectorAll(".ui-select-dropdown"),0===b.length)return;b[0].style.opacity=0,n(function(){if("up"===h.dropdownPosition)x();else{a.removeClass(w);var t=i(a),s=i(b),c=e[0].documentElement.scrollTop||e[0].body.scrollTop;t.top+t.height+s.height>c+e[0].documentElement.clientHeight?x(t,s):y(t,s)}b[0].style.opacity=1})}else{if(null===b||0===b.length)return;b[0].style.position="",b[0].style.top="",a.removeClass(w)}}}}}}]),s.directive("uiSelectMatch",["uiSelectConfig",function(e){return{restrict:"EA",require:"^uiSelect",replace:!0,transclude:!0,templateUrl:function(t){t.addClass("ui-select-match");var s=t.parent().attr("theme")||e.theme,i=t.parent().attr("multiple");return s+(i?"/match-multiple.tpl.html":"/match.tpl.html")},link:function(t,s,i,c){function l(e){c.allowClear=angular.isDefined(e)?""===e?!0:"true"===e.toLowerCase():!1}c.lockChoiceExpression=i.uiLockChoice,i.$observe("placeholder",function(t){c.placeholder=void 0!==t?t:e.placeholder}),i.$observe("allowClear",l),l(i.allowClear),c.multiple&&c.sizeSearchInput()}}}]),s.directive("uiSelectMultiple",["uiSelectMinErr","$timeout",function(t,s){return{restrict:"EA",require:["^uiSelect","^ngModel"],controller:["$scope","$timeout",function(e,t){var s,i=this,c=e.$select;angular.isUndefined(c.selected)&&(c.selected=[]),e.$evalAsync(function(){s=e.ngModel}),i.activeMatchIndex=-1,i.updateModel=function(){s.$setViewValue(Date.now()),i.refreshComponent()},i.refreshComponent=function(){c.refreshItems(),c.sizeSearchInput()},i.removeChoice=function(s){var l=c.selected[s];if(!l._uiSelectChoiceLocked){var n={};n[c.parserResult.itemName]=l,c.selected.splice(s,1),i.activeMatchIndex=-1,c.sizeSearchInput(),t(function(){c.onRemoveCallback(e,{$item:l,$model:c.parserResult.modelMapper(e,n)})}),i.updateModel()}},i.getPlaceholder=function(){return c.selected&&c.selected.length?void 0:c.placeholder}}],controllerAs:"$selectMultiple",link:function(i,c,l,n){function a(e){return angular.isNumber(e.selectionStart)?e.selectionStart:e.value.length}function r(t){function s(){switch(t){case e.LEFT:return~g.activeMatchIndex?u:n;case e.RIGHT:return~g.activeMatchIndex&&r!==n?o:(d.activate(),!1);case e.BACKSPACE:return~g.activeMatchIndex?(g.removeChoice(r),u):n;case e.DELETE:return~g.activeMatchIndex?(g.removeChoice(g.activeMatchIndex),r):!1}}var i=a(d.searchInput[0]),c=d.selected.length,l=0,n=c-1,r=g.activeMatchIndex,o=g.activeMatchIndex+1,u=g.activeMatchIndex-1,p=r;return i>0||d.search.length&&t==e.RIGHT?!1:(d.close(),p=s(),g.activeMatchIndex=d.selected.length&&p!==!1?Math.min(n,Math.max(l,p)):-1,!0)}function o(e){if(void 0===e||void 0===d.search)return!1;var t=e.filter(function(e){return void 0===d.search.toUpperCase()||void 0===e?!1:e.toUpperCase()===d.search.toUpperCase()}).length>0;return t}function u(e,t){var s=-1;if(angular.isArray(e))for(var i=angular.copy(e),c=0;c<i.length;c++)if(void 0===d.tagging.fct)i[c]+" "+d.taggingLabel===t&&(s=c);else{var l=i[c];angular.isObject(l)&&(l.isTag=!0),angular.equals(l,t)&&(s=c)}return s}var d=n[0],p=i.ngModel=n[1],g=i.$selectMultiple;d.multiple=!0,d.removeSelected=!0,d.focusInput=d.searchInput,p.$isEmpty=function(e){return!e||0===e.length},p.$parsers.unshift(function(){for(var e,t={},s=[],c=d.selected.length-1;c>=0;c--)t={},t[d.parserResult.itemName]=d.selected[c],e=d.parserResult.modelMapper(i,t),s.unshift(e);return s}),p.$formatters.unshift(function(e){var t,s=d.parserResult.source(i,{$select:{search:""}}),c={};if(!s)return e;var l=[],n=function(e,s){if(e&&e.length){for(var n=e.length-1;n>=0;n--){if(c[d.parserResult.itemName]=e[n],t=d.parserResult.modelMapper(i,c),d.parserResult.trackByExp){var a=/(\w*)\./.exec(d.parserResult.trackByExp),r=/\.([^\s]+)/.exec(d.parserResult.trackByExp);if(a&&a.length>0&&a[1]==d.parserResult.itemName&&r&&r.length>0&&t[r[1]]==s[r[1]])return l.unshift(e[n]),!0}if(angular.equals(t,s))return l.unshift(e[n]),!0}return!1}};if(!e)return l;for(var a=e.length-1;a>=0;a--)n(d.selected,e[a])||n(s,e[a])||l.unshift(e[a]);return l}),i.$watchCollection(function(){return p.$modelValue},function(e,t){t!=e&&(p.$modelValue=null,g.refreshComponent())}),p.$render=function(){if(!angular.isArray(p.$viewValue)){if(!angular.isUndefined(p.$viewValue)&&null!==p.$viewValue)throw t("multiarr","Expected model value to be array but got '{0}'",p.$viewValue);d.selected=[]}d.selected=p.$viewValue,g.refreshComponent(),i.$evalAsync()},i.$on("uis:select",function(e,t){d.selected.length>=d.limit||(d.selected.push(t),g.updateModel())}),i.$on("uis:activate",function(){g.activeMatchIndex=-1}),i.$watch("$select.disabled",function(e,t){t&&!e&&d.sizeSearchInput()}),d.searchInput.on("keydown",function(t){var s=t.which;i.$apply(function(){var i=!1;e.isHorizontalMovement(s)&&(i=r(s)),i&&s!=e.TAB&&(t.preventDefault(),t.stopPropagation())})}),d.searchInput.on("keyup",function(t){if(e.isVerticalMovement(t.which)||i.$evalAsync(function(){d.activeIndex=d.taggingLabel===!1?-1:0}),d.tagging.isActivated&&d.search.length>0){if(t.which===e.TAB||e.isControl(t)||e.isFunctionKey(t)||t.which===e.ESC||e.isVerticalMovement(t.which))return;if(d.activeIndex=d.taggingLabel===!1?-1:0,d.taggingLabel===!1)return;var s,c,l,n,a=angular.copy(d.items),r=angular.copy(d.items),p=!1,g=-1;if(void 0!==d.tagging.fct){if(l=d.$filter("filter")(a,{isTag:!0}),l.length>0&&(n=l[0]),a.length>0&&n&&(p=!0,a=a.slice(1,a.length),r=r.slice(1,r.length)),s=d.tagging.fct(d.search),r.some(function(e){return angular.equals(e,d.tagging.fct(d.search))})||d.selected.some(function(e){return angular.equals(e,s)}))return i.$evalAsync(function(){d.activeIndex=0,d.items=a}),void 0;s.isTag=!0}else{if(l=d.$filter("filter")(a,function(e){return e.match(d.taggingLabel)}),l.length>0&&(n=l[0]),c=a[0],void 0!==c&&a.length>0&&n&&(p=!0,a=a.slice(1,a.length),r=r.slice(1,r.length)),s=d.search+" "+d.taggingLabel,u(d.selected,d.search)>-1)return;if(o(r.concat(d.selected)))return p&&(a=r,i.$evalAsync(function(){d.activeIndex=0,d.items=a})),void 0;if(o(r))return p&&(d.items=r.slice(1,r.length)),void 0}p&&(g=u(d.selected,s)),g>-1?a=a.slice(g+1,a.length-1):(a=[],a.push(s),a=a.concat(r)),i.$evalAsync(function(){d.activeIndex=0,d.items=a})}}),d.searchInput.on("blur",function(){s(function(){g.activeMatchIndex=-1})})}}}]),s.directive("uiSelectSingle",["$timeout","$compile",function(t,s){return{restrict:"EA",require:["^uiSelect","^ngModel"],link:function(i,c,l,n){var a=n[0],r=n[1];r.$parsers.unshift(function(e){var t,s={};return s[a.parserResult.itemName]=e,t=a.parserResult.modelMapper(i,s)}),r.$formatters.unshift(function(e){var t,s=a.parserResult.source(i,{$select:{search:""}}),c={};if(s){var l=function(s){return c[a.parserResult.itemName]=s,t=a.parserResult.modelMapper(i,c),t==e};if(a.selected&&l(a.selected))return a.selected;for(var n=s.length-1;n>=0;n--)if(l(s[n]))return s[n]}return e}),i.$watch("$select.selected",function(e){r.$viewValue!==e&&r.$setViewValue(e)}),r.$render=function(){a.selected=r.$viewValue},i.$on("uis:select",function(e,t){a.selected=t}),i.$on("uis:close",function(e,s){t(function(){a.focusser.prop("disabled",!1),s||a.focusser[0].focus()},0,!1)}),i.$on("uis:activate",function(){o.prop("disabled",!0)});var o=angular.element("<input ng-disabled='$select.disabled' class='ui-select-focusser ui-select-offscreen' type='text' id='{{ $select.focusserId }}' aria-label='{{ $select.focusserTitle }}' aria-haspopup='true' role='button' />");s(o)(i),a.focusser=o,a.focusInput=o,c.parent().append(o),o.bind("focus",function(){i.$evalAsync(function(){a.focus=!0})}),o.bind("blur",function(){i.$evalAsync(function(){a.focus=!1})}),o.bind("keydown",function(t){return t.which===e.BACKSPACE?(t.preventDefault(),t.stopPropagation(),a.select(void 0),i.$apply(),void 0):(t.which===e.TAB||e.isControl(t)||e.isFunctionKey(t)||t.which===e.ESC||((t.which==e.DOWN||t.which==e.UP||t.which==e.ENTER||t.which==e.SPACE)&&(t.preventDefault(),t.stopPropagation(),a.activate()),i.$digest()),void 0)}),o.bind("keyup input",function(t){t.which===e.TAB||e.isControl(t)||e.isFunctionKey(t)||t.which===e.ESC||t.which==e.ENTER||t.which===e.BACKSPACE||(a.activate(o.val()),o.val(""),i.$digest())})}}}]),s.directive("uiSelectSort",["$timeout","uiSelectConfig","uiSelectMinErr",function(e,t,s){return{require:"^^uiSelect",link:function(t,i,c,l){if(null===t[c.uiSelectSort])throw s("sort","Expected a list to sort");var n=angular.extend({axis:"horizontal"},t.$eval(c.uiSelectSortOptions)),a=n.axis,r="dragging",o="dropping",u="dropping-before",d="dropping-after";t.$watch(function(){return l.sortable},function(e){e?i.attr("draggable",!0):i.removeAttr("draggable")}),i.on("dragstart",function(e){i.addClass(r),(e.dataTransfer||e.originalEvent.dataTransfer).setData("text",t.$index.toString())}),i.on("dragend",function(){i.removeClass(r)});var p,g=function(e,t){this.splice(t,0,this.splice(e,1)[0])},h=function(e){e.preventDefault();var t="vertical"===a?e.offsetY||e.layerY||(e.originalEvent?e.originalEvent.offsetY:0):e.offsetX||e.layerX||(e.originalEvent?e.originalEvent.offsetX:0);t<this["vertical"===a?"offsetHeight":"offsetWidth"]/2?(i.removeClass(d),i.addClass(u)):(i.removeClass(u),i.addClass(d))},f=function(t){t.preventDefault();var s=parseInt((t.dataTransfer||t.originalEvent.dataTransfer).getData("text"),10);e.cancel(p),p=e(function(){v(s)},20)},v=function(e){var s=t.$eval(c.uiSelectSort),l=s[e],n=null;n=i.hasClass(u)?e<t.$index?t.$index-1:t.$index:e<t.$index?t.$index:t.$index+1,g.apply(s,[e,n]),t.$apply(function(){t.$emit("uiSelectSort:change",{array:s,item:l,from:e,to:n})}),i.removeClass(o),i.removeClass(u),i.removeClass(d),i.off("drop",f)};i.on("dragenter",function(){i.hasClass(r)||(i.addClass(o),i.on("dragover",h),i.on("drop",f))}),i.on("dragleave",function(e){e.target==i&&(i.removeClass(o),i.removeClass(u),i.removeClass(d),i.off("dragover",h),i.off("drop",f))})}}}]),s.service("uisRepeatParser",["uiSelectMinErr","$parse",function(e,t){var s=this;s.parse=function(s){var i;if(i=s.match(/^\s*(?:([\s\S]+?)\s+as\s+)?(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(\s*[\s\S]+?)?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),!i)throw e("iexp","Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",s);var c=i[5],l="";if(i[3]){c=i[5].replace(/(^\()|(\)$)/g,"");var n=i[5].match(/^\s*(?:[\s\S]+?)(?:[^\|]|\|\|)+([\s\S]*)\s*$/);n&&n[1].trim()&&(l=n[1],c=c.replace(l,""))}return{itemName:i[4]||i[2],keyName:i[3],source:t(c),filters:l,trackByExp:i[6],modelMapper:t(i[1]||i[4]||i[2]),repeatExpression:function(e){var t=this.itemName+" in "+(e?"$group.items":"$select.items");return this.trackByExp&&(t+=" track by "+this.trackByExp),t}}},s.getGroupNgRepeatExpression=function(){return"$group in $select.groups"}}])}(),angular.module("ui.select").run(["$templateCache",function(e){e.put("bootstrap/choices.tpl.html",'<ul class="ui-select-choices ui-select-choices-content ui-select-dropdown dropdown-menu" role="listbox" ng-show="$select.open"><li class="ui-select-choices-group" id="ui-select-choices-{{ $select.generatedId }}"><div class="divider" ng-show="$select.isGrouped && $index > 0"></div><div ng-show="$select.isGrouped" class="ui-select-choices-group-label dropdown-header" ng-bind="$group.name"></div><div id="ui-select-choices-row-{{ $select.generatedId }}-{{$index}}" class="ui-select-choices-row" ng-class="{active: $select.isActive(this), disabled: $select.isDisabled(this)}" role="option"><a href="" class="ui-select-choices-row-inner"></a></div></li></ul>'),e.put("bootstrap/match-multiple.tpl.html",'<span class="ui-select-match"><span ng-repeat="$item in $select.selected"><span class="ui-select-match-item btn btn-default btn-xs" tabindex="-1" type="button" ng-disabled="$select.disabled" ng-click="$selectMultiple.activeMatchIndex = $index;" ng-class="{\'btn-primary\':$selectMultiple.activeMatchIndex === $index, \'select-locked\':$select.isLocked(this, $index)}" ui-select-sort="$select.selected"><span class="close ui-select-match-close" ng-hide="$select.disabled" ng-click="$selectMultiple.removeChoice($index)">&nbsp;&times;</span> <span uis-transclude-append=""></span></span></span></span>'),e.put("bootstrap/match.tpl.html",'<div class="ui-select-match" ng-hide="$select.open" ng-disabled="$select.disabled" ng-class="{\'btn-default-focus\':$select.focus}"><span tabindex="-1" class="btn btn-default form-control ui-select-toggle" aria-label="{{ $select.baseTitle }} activate" ng-disabled="$select.disabled" ng-click="$select.activate()" style="outline: 0;"><span ng-show="$select.isEmpty()" class="ui-select-placeholder text-muted">{{$select.placeholder}}</span> <span ng-hide="$select.isEmpty()" class="ui-select-match-text pull-left" ng-class="{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}" ng-transclude=""></span> <i class="caret pull-right" ng-click="$select.toggle($event)"></i> <a ng-show="$select.allowClear && !$select.isEmpty()" aria-label="{{ $select.baseTitle }} clear" style="margin-right: 10px" ng-click="$select.clear($event)" class="btn btn-xs btn-link pull-right"><i class="glyphicon glyphicon-remove" aria-hidden="true"></i></a></span></div>'),e.put("bootstrap/select-multiple.tpl.html",'<div class="ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control" ng-class="{open: $select.open}"><div><div class="ui-select-match"></div><input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="ui-select-search input-xs" placeholder="{{$selectMultiple.getPlaceholder()}}" ng-disabled="$select.disabled" ng-hide="$select.disabled" ng-click="$select.activate()" ng-model="$select.search" role="combobox" aria-label="{{ $select.baseTitle }}" ondrop="return false;"></div><div class="ui-select-choices"></div></div>'),e.put("bootstrap/select.tpl.html",'<div class="ui-select-container ui-select-bootstrap dropdown" ng-class="{open: $select.open}"><div class="ui-select-match"></div><input type="text" autocomplete="off" tabindex="-1" aria-expanded="true" aria-label="{{ $select.baseTitle }}" aria-owns="ui-select-choices-{{ $select.generatedId }}" aria-activedescendant="ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}" class="form-control ui-select-search" placeholder="{{$select.placeholder}}" ng-model="$select.search" ng-show="$select.searchEnabled && $select.open"><div class="ui-select-choices"></div></div>'),e.put("select2/choices.tpl.html",'<ul class="ui-select-choices ui-select-choices-content select2-results"><li class="ui-select-choices-group" ng-class="{\'select2-result-with-children\': $select.choiceGrouped($group) }"><div ng-show="$select.choiceGrouped($group)" class="ui-select-choices-group-label select2-result-label" ng-bind="$group.name"></div><ul role="listbox" id="ui-select-choices-{{ $select.generatedId }}" ng-class="{\'select2-result-sub\': $select.choiceGrouped($group), \'select2-result-single\': !$select.choiceGrouped($group) }"><li role="option" id="ui-select-choices-row-{{ $select.generatedId }}-{{$index}}" class="ui-select-choices-row" ng-class="{\'select2-highlighted\': $select.isActive(this), \'select2-disabled\': $select.isDisabled(this)}"><div class="select2-result-label ui-select-choices-row-inner"></div></li></ul></li></ul>'),e.put("select2/match-multiple.tpl.html",'<span class="ui-select-match"><li class="ui-select-match-item select2-search-choice" ng-repeat="$item in $select.selected" ng-class="{\'select2-search-choice-focus\':$selectMultiple.activeMatchIndex === $index, \'select2-locked\':$select.isLocked(this, $index)}" ui-select-sort="$select.selected"><span uis-transclude-append=""></span> <a href="javascript:;" class="ui-select-match-close select2-search-choice-close" ng-click="$selectMultiple.removeChoice($index)" tabindex="-1"></a></li></span>'),e.put("select2/match.tpl.html",'<a class="select2-choice ui-select-match" ng-class="{\'select2-default\': $select.isEmpty()}" ng-click="$select.toggle($event)" aria-label="{{ $select.baseTitle }} select"><span ng-show="$select.isEmpty()" class="select2-chosen">{{$select.placeholder}}</span> <span ng-hide="$select.isEmpty()" class="select2-chosen" ng-transclude=""></span> <abbr ng-if="$select.allowClear && !$select.isEmpty()" class="select2-search-choice-close" ng-click="$select.clear($event)"></abbr> <span class="select2-arrow ui-select-toggle"><b></b></span></a>'),e.put("select2/select-multiple.tpl.html",'<div class="ui-select-container ui-select-multiple select2 select2-container select2-container-multi" ng-class="{\'select2-container-active select2-dropdown-open open\': $select.open, \'select2-container-disabled\': $select.disabled}"><ul class="select2-choices"><span class="ui-select-match"></span><li class="select2-search-field"><input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="combobox" aria-expanded="true" aria-owns="ui-select-choices-{{ $select.generatedId }}" aria-label="{{ $select.baseTitle }}" aria-activedescendant="ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}" class="select2-input ui-select-search" placeholder="{{$selectMultiple.getPlaceholder()}}" ng-disabled="$select.disabled" ng-hide="$select.disabled" ng-model="$select.search" ng-click="$select.activate()" style="width: 34px;" ondrop="return false;"></li></ul><div class="ui-select-dropdown select2-drop select2-with-searchbox select2-drop-active" ng-class="{\'select2-display-none\': !$select.open}"><div class="ui-select-choices"></div></div></div>'),e.put("select2/select.tpl.html",'<div class="ui-select-container select2 select2-container" ng-class="{\'select2-container-active select2-dropdown-open open\': $select.open, \'select2-container-disabled\': $select.disabled, \'select2-container-active\': $select.focus, \'select2-allowclear\': $select.allowClear && !$select.isEmpty()}"><div class="ui-select-match"></div><div class="ui-select-dropdown select2-drop select2-with-searchbox select2-drop-active" ng-class="{\'select2-display-none\': !$select.open}"><div class="select2-search" ng-show="$select.searchEnabled"><input type="text" autocomplete="off" autocorrect="false" autocapitalize="off" spellcheck="false" role="combobox" aria-expanded="true" aria-owns="ui-select-choices-{{ $select.generatedId }}" aria-label="{{ $select.baseTitle }}" aria-activedescendant="ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}" class="ui-select-search select2-input" ng-model="$select.search"></div><div class="ui-select-choices"></div></div></div>'),e.put("selectize/choices.tpl.html",'<div ng-show="$select.open" class="ui-select-choices ui-select-dropdown selectize-dropdown single"><div class="ui-select-choices-content selectize-dropdown-content"><div class="ui-select-choices-group optgroup" role="listbox"><div ng-show="$select.isGrouped" class="ui-select-choices-group-label optgroup-header" ng-bind="$group.name"></div><div role="option" class="ui-select-choices-row" ng-class="{active: $select.isActive(this), disabled: $select.isDisabled(this)}"><div class="option ui-select-choices-row-inner" data-selectable=""></div></div></div></div></div>'),e.put("selectize/match.tpl.html",'<div ng-hide="($select.open || $select.isEmpty())" class="ui-select-match" ng-transclude=""></div>'),e.put("selectize/select.tpl.html",'<div class="ui-select-container selectize-control single" ng-class="{\'open\': $select.open}"><div class="selectize-input" ng-class="{\'focus\': $select.open, \'disabled\': $select.disabled, \'selectize-focus\' : $select.focus}" ng-click="$select.open && !$select.searchEnabled ? $select.toggle($event) : $select.activate()"><div class="ui-select-match"></div><input type="text" autocomplete="off" tabindex="-1" class="ui-select-search ui-select-toggle" ng-click="$select.toggle($event)" placeholder="{{$select.placeholder}}" ng-model="$select.search" ng-hide="!$select.searchEnabled || ($select.selected && !$select.open)" ng-disabled="$select.disabled" aria-label="{{ $select.baseTitle }}"></div><div class="ui-select-choices"></div></div>')
}]);
/*
 AngularJS v1.5.3
 (c) 2010-2016 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(A,e,B){'use strict';function C(a){var c=[];v(c,e.noop).chars(a);return c.join("")}function h(a,c){var b={},d=a.split(","),l;for(l=0;l<d.length;l++)b[c?e.lowercase(d[l]):d[l]]=!0;return b}function D(a,c){null===a||a===B?a="":"string"!==typeof a&&(a=""+a);g.innerHTML=a;var b=5;do{if(0===b)throw w("uinput");b--;11>=document.documentMode&&n(g);a=g.innerHTML;g.innerHTML=a}while(a!==g.innerHTML);for(b=g.firstChild;b;){switch(b.nodeType){case 1:c.start(b.nodeName.toLowerCase(),E(b.attributes));
break;case 3:c.chars(b.textContent)}var d;if(!(d=b.firstChild)&&(1==b.nodeType&&c.end(b.nodeName.toLowerCase()),d=b.nextSibling,!d))for(;null==d;){b=b.parentNode;if(b===g)break;d=b.nextSibling;1==b.nodeType&&c.end(b.nodeName.toLowerCase())}b=d}for(;b=g.firstChild;)g.removeChild(b)}function E(a){for(var c={},b=0,d=a.length;b<d;b++){var l=a[b];c[l.name]=l.value}return c}function x(a){return a.replace(/&/g,"&amp;").replace(F,function(a){var b=a.charCodeAt(0);a=a.charCodeAt(1);return"&#"+(1024*(b-55296)+
(a-56320)+65536)+";"}).replace(G,function(a){return"&#"+a.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}function v(a,c){var b=!1,d=e.bind(a,a.push);return{start:function(a,f){a=e.lowercase(a);!b&&H[a]&&(b=a);b||!0!==t[a]||(d("<"),d(a),e.forEach(f,function(b,f){var g=e.lowercase(f),h="img"===a&&"src"===g||"background"===g;!0!==I[g]||!0===y[g]&&!c(b,h)||(d(" "),d(f),d('="'),d(x(b)),d('"'))}),d(">"))},end:function(a){a=e.lowercase(a);b||!0!==t[a]||!0===z[a]||(d("</"),d(a),d(">"));a==
b&&(b=!1)},chars:function(a){b||d(x(a))}}}function n(a){if(a.nodeType===Node.ELEMENT_NODE)for(var c=a.attributes,b=0,d=c.length;b<d;b++){var e=c[b],f=e.name.toLowerCase();if("xmlns:ns1"===f||0===f.indexOf("ns1:"))a.removeAttributeNode(e),b--,d--}(c=a.firstChild)&&n(c);(c=a.nextSibling)&&n(c)}var w=e.$$minErr("$sanitize"),F=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,G=/([^\#-~ |!])/g,z=h("area,br,col,hr,img,wbr"),q=h("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),k=h("rp,rt"),u=e.extend({},k,q),q=e.extend({},
q,h("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul")),k=e.extend({},k,h("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),J=h("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,stop,svg,switch,text,title,tspan"),
H=h("script,style"),t=e.extend({},z,q,k,u),y=h("background,cite,href,longdesc,src,xlink:href"),u=h("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,valign,value,vspace,width"),k=h("accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan",
!0),I=e.extend({},y,k,u),g;(function(a){if(a.document&&a.document.implementation)a=a.document.implementation.createHTMLDocument("inert");else throw w("noinert");var c=(a.documentElement||a.getDocumentElement()).getElementsByTagName("body");1===c.length?g=c[0]:(c=a.createElement("html"),g=a.createElement("body"),c.appendChild(g),a.appendChild(c))})(A);e.module("ngSanitize",[]).provider("$sanitize",function(){var a=!1;this.$get=["$$sanitizeUri",function(c){a&&e.extend(t,J);return function(a){var d=
[];D(a,v(d,function(a,b){return!/^unsafe:/.test(c(a,b))}));return d.join("")}}];this.enableSvg=function(c){return e.isDefined(c)?(a=c,this):a}});e.module("ngSanitize").filter("linky",["$sanitize",function(a){var c=/((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,b=/^mailto:/i,d=e.$$minErr("linky"),g=e.isString;return function(f,h,m){function k(a){a&&p.push(C(a))}function q(a,b){var c;p.push("<a ");e.isFunction(m)&&(m=m(a));if(e.isObject(m))for(c in m)p.push(c+
'="'+m[c]+'" ');else m={};!e.isDefined(h)||"target"in m||p.push('target="',h,'" ');p.push('href="',a.replace(/"/g,"&quot;"),'">');k(b);p.push("</a>")}if(null==f||""===f)return f;if(!g(f))throw d("notstring",f);for(var r=f,p=[],s,n;f=r.match(c);)s=f[0],f[2]||f[4]||(s=(f[3]?"http://":"mailto:")+s),n=f.index,k(r.substr(0,n)),q(s,f[0].replace(b,"")),r=r.substring(n+f[0].length);k(r);return a(p.join(""))}}])})(window,window.angular);
//# sourceMappingURL=angular-sanitize.min.js.map

/**
 * angular-ui-notification - Angular.js service providing simple notifications using Bootstrap 3 styles with css transitions for animating
 * @author Alex_Crack
 * @version v0.1.0
 * @link https://github.com/alexcrack/angular-ui-notification
 * @license MIT
 */
angular.module("ui-notification",[]),angular.module("ui-notification").provider("Notification",function(){this.options={delay:5e3,startTop:10,startRight:10,verticalSpacing:10,horizontalSpacing:10,positionX:"right",positionY:"top",replaceMessage:!1,templateUrl:"angular-ui-notification.html"},this.setOptions=function(t){if(!angular.isObject(t))throw new Error("Options should be an object!");this.options=angular.extend({},this.options,t)},this.$get=["$timeout","$http","$compile","$templateCache","$rootScope","$injector","$sce","$q","$window",function(t,e,i,n,o,s,a,r,l){var p=this.options,c=p.startTop,u=p.startRight,d=p.verticalSpacing,m=p.horizontalSpacing,g=p.delay,f=[],h=!1,y=function(s,y){var v=r.defer();return"object"!=typeof s&&(s={message:s}),s.scope=s.scope?s.scope:o,s.template=s.templateUrl?s.templateUrl:p.templateUrl,s.delay=angular.isUndefined(s.delay)?g:s.delay,s.type=y||p.type||"",s.positionY=s.positionY?s.positionY:p.positionY,s.positionX=s.positionX?s.positionX:p.positionX,s.replaceMessage=s.replaceMessage?s.replaceMessage:p.replaceMessage,e.get(s.template,{cache:n}).success(function(e){var n=s.scope.$new();n.message=a.trustAsHtml(s.message),n.title=a.trustAsHtml(s.title),n.t=s.type.substr(0,1),n.delay=s.delay;var o=function(){for(var t=0,e=0,i=c,n=u,o=[],a=f.length-1;a>=0;a--){var r=f[a];if(s.replaceMessage&&a<f.length-1)r.addClass("killed");else{var l=parseInt(r[0].offsetHeight),p=parseInt(r[0].offsetWidth),g=o[r._positionY+r._positionX];h+l>window.innerHeight&&(g=c,e++,t=0);var h=i=g?0===t?g:g+d:c,y=n+e*(m+p);r.css(r._positionY,h+"px"),"center"==r._positionX?r.css("left",parseInt(window.innerWidth/2-p/2)+"px"):r.css(r._positionX,y+"px"),o[r._positionY+r._positionX]=h+l,t++}}},r=i(e)(n);r._positionY=s.positionY,r._positionX=s.positionX,r.addClass(s.type),r.bind("webkitTransitionEnd oTransitionEnd otransitionend transitionend msTransitionEnd click",function(t){t=t.originalEvent||t,("click"===t.type||"opacity"===t.propertyName&&t.elapsedTime>=1)&&(r.remove(),f.splice(f.indexOf(r),1),o())}),angular.isNumber(s.delay)&&t(function(){r.addClass("killed")},s.delay),angular.element(document.getElementsByTagName("body")).append(r);var p=-(parseInt(r[0].offsetHeight)+50);r.css(r._positionY,p+"px"),f.push(r),n._templateElement=r,n.kill=function(e){e?(f.splice(f.indexOf(n._templateElement),1),n._templateElement.remove(),t(o)):n._templateElement.addClass("killed")},t(o),h||(angular.element(l).bind("resize",function(){t(o)}),h=!0),v.resolve(n)}).error(function(t){throw new Error("Template ("+s.template+") could not be loaded. "+t)}),v.promise};return y.primary=function(t){return this(t,"primary")},y.error=function(t){return this(t,"error")},y.success=function(t){return this(t,"success")},y.info=function(t){return this(t,"info")},y.warning=function(t){return this(t,"warning")},y.clearAll=function(){angular.forEach(f,function(t){t.addClass("killed")})},y}]}),angular.module("ui-notification").run(["$templateCache",function(t){t.put("angular-ui-notification.html",'<div class="ui-notification"><h3 ng-show="title" ng-bind-html="title"></h3><div class="message" ng-bind-html="message"></div></div>')}]);

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `humanize` variable.
  var previousHumanize = root.humanize;

  var humanize = {};

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = humanize;
    }
    exports.humanize = humanize;
  } else {
    if (typeof define === 'function' && define.amd) {
      define('humanize', function() {
        return humanize;
      });
    }
    root.humanize = humanize;
  }

  humanize.noConflict = function() {
    root.humanize = previousHumanize;
    return this;
  };

  humanize.pad = function(str, count, padChar, type) {
    str += '';
    if (!padChar) {
      padChar = ' ';
    } else if (padChar.length > 1) {
      padChar = padChar.charAt(0);
    }
    type = (type === undefined) ? 'left' : 'right';

    if (type === 'right') {
      while (str.length < count) {
        str = str + padChar;
      }
    } else {
      // default to left
      while (str.length < count) {
        str = padChar + str;
      }
    }

    return str;
  };

  // gets current unix time
  humanize.time = function() {
    return new Date().getTime() / 1000;
  };

  /**
   * PHP-inspired date
   */

                        /*  jan  feb  mar  apr  may  jun  jul  aug  sep  oct  nov  dec */
  var dayTableCommon = [ 0,   0,  31,  59,  90, 120, 151, 181, 212, 243, 273, 304, 334 ];
  var dayTableLeap   = [ 0,   0,  31,  60,  91, 121, 152, 182, 213, 244, 274, 305, 335 ];
  // var mtable_common[13] = {  0,  31,  28,  31,  30,  31,  30,  31,  31,  30,  31,  30,  31 };
  // static int ml_table_leap[13]   = {  0,  31,  29,  31,  30,  31,  30,  31,  31,  30,  31,  30,  31 };


  humanize.date = function(format, timestamp) {
    var jsdate = ((timestamp === undefined) ? new Date() : // Not provided
                  (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
                  new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
                 );

    var formatChr = /\\?([a-z])/gi;
    var formatChrCb = function (t, s) {
      return f[t] ? f[t]() : s;
    };

    var shortDayTxt = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var monthTxt = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var f = {
      /* Day */
      // Day of month w/leading 0; 01..31
      d: function () { return humanize.pad(f.j(), 2, '0'); },

      // Shorthand day name; Mon..Sun
      D: function () { return f.l().slice(0, 3); },

      // Day of month; 1..31
      j: function () { return jsdate.getDate(); },

      // Full day name; Monday..Sunday
      l: function () { return shortDayTxt[f.w()]; },

      // ISO-8601 day of week; 1[Mon]..7[Sun]
      N: function () { return f.w() || 7; },

      // Ordinal suffix for day of month; st, nd, rd, th
      S: function () {
        var j = f.j();
        return j > 4 && j < 21 ? 'th' : {1: 'st', 2: 'nd', 3: 'rd'}[j % 10] || 'th';
      },

      // Day of week; 0[Sun]..6[Sat]
      w: function () { return jsdate.getDay(); },

      // Day of year; 0..365
      z: function () {
        return (f.L() ? dayTableLeap[f.n()] : dayTableCommon[f.n()]) + f.j() - 1;
      },

      /* Week */
      // ISO-8601 week number
      W: function () {
        // days between midweek of this week and jan 4
        // (f.z() - f.N() + 1 + 3.5) - 3
        var midWeekDaysFromJan4 = f.z() - f.N() + 1.5;
        // 1 + number of weeks + rounded week
        return humanize.pad(1 + Math.floor(Math.abs(midWeekDaysFromJan4) / 7) + (midWeekDaysFromJan4 % 7 > 3.5 ? 1 : 0), 2, '0');
      },

      /* Month */
      // Full month name; January..December
      F: function () { return monthTxt[jsdate.getMonth()]; },

      // Month w/leading 0; 01..12
      m: function () { return humanize.pad(f.n(), 2, '0'); },

      // Shorthand month name; Jan..Dec
      M: function () { return f.F().slice(0, 3); },

      // Month; 1..12
      n: function () { return jsdate.getMonth() + 1; },

      // Days in month; 28..31
      t: function () { return (new Date(f.Y(), f.n(), 0)).getDate(); },

      /* Year */
      // Is leap year?; 0 or 1
      L: function () { return new Date(f.Y(), 1, 29).getMonth() === 1 ? 1 : 0; },

      // ISO-8601 year
      o: function () {
        var n = f.n();
        var W = f.W();
        return f.Y() + (n === 12 && W < 9 ? -1 : n === 1 && W > 9);
      },

      // Full year; e.g. 1980..2010
      Y: function () { return jsdate.getFullYear(); },

      // Last two digits of year; 00..99
      y: function () { return (String(f.Y())).slice(-2); },

      /* Time */
      // am or pm
      a: function () { return jsdate.getHours() > 11 ? 'pm' : 'am'; },

      // AM or PM
      A: function () { return f.a().toUpperCase(); },

      // Swatch Internet time; 000..999
      B: function () {
        var unixTime = jsdate.getTime() / 1000;
        var secondsPassedToday = unixTime % 86400 + 3600; // since it's based off of UTC+1
        if (secondsPassedToday < 0) { secondsPassedToday += 86400; }
        var beats = ((secondsPassedToday) / 86.4) % 1000;
        if (unixTime < 0) {
          return Math.ceil(beats);
        }
        return Math.floor(beats);
      },

      // 12-Hours; 1..12
      g: function () { return f.G() % 12 || 12; },

      // 24-Hours; 0..23
      G: function () { return jsdate.getHours(); },

      // 12-Hours w/leading 0; 01..12
      h: function () { return humanize.pad(f.g(), 2, '0'); },

      // 24-Hours w/leading 0; 00..23
      H: function () { return humanize.pad(f.G(), 2, '0'); },

      // Minutes w/leading 0; 00..59
      i: function () { return humanize.pad(jsdate.getMinutes(), 2, '0'); },

      // Seconds w/leading 0; 00..59
      s: function () { return humanize.pad(jsdate.getSeconds(), 2, '0'); },

      // Microseconds; 000000-999000
      u: function () { return humanize.pad(jsdate.getMilliseconds() * 1000, 6, '0'); },

      // Whether or not the date is in daylight savings time
      /*
      I: function () {
        // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
        // If they are not equal, then DST is observed.
        var Y = f.Y();
        return 0 + ((new Date(Y, 0) - Date.UTC(Y, 0)) !== (new Date(Y, 6) - Date.UTC(Y, 6)));
      },
      */

      // Difference to GMT in hour format; e.g. +0200
      O: function () {
        var tzo = jsdate.getTimezoneOffset();
        var tzoNum = Math.abs(tzo);
        return (tzo > 0 ? '-' : '+') + humanize.pad(Math.floor(tzoNum / 60) * 100 + tzoNum % 60, 4, '0');
      },

      // Difference to GMT w/colon; e.g. +02:00
      P: function () {
        var O = f.O();
        return (O.substr(0, 3) + ':' + O.substr(3, 2));
      },

      // Timezone offset in seconds (-43200..50400)
      Z: function () { return -jsdate.getTimezoneOffset() * 60; },

      // Full Date/Time, ISO-8601 date
      c: function () { return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb); },

      // RFC 2822
      r: function () { return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb); },

      // Seconds since UNIX epoch
      U: function () { return jsdate.getTime() / 1000 || 0; }
    };    

    return format.replace(formatChr, formatChrCb);
  };


  /**
   * format number by adding thousands separaters and significant digits while rounding
   */
  humanize.numberFormat = function(number, decimals, decPoint, thousandsSep) {
    decimals = isNaN(decimals) ? 2 : Math.abs(decimals);
    decPoint = (decPoint === undefined) ? '.' : decPoint;
    thousandsSep = (thousandsSep === undefined) ? ',' : thousandsSep;

    var sign = number < 0 ? '-' : '';
    number = Math.abs(+number || 0);

    var intPart = parseInt(number.toFixed(decimals), 10) + '';
    var j = intPart.length > 3 ? intPart.length % 3 : 0;

    return sign + (j ? intPart.substr(0, j) + thousandsSep : '') + intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandsSep) + (decimals ? decPoint + Math.abs(number - intPart).toFixed(decimals).slice(2) : '');
  };


  /**
   * For dates that are the current day or within one day, return 'today', 'tomorrow' or 'yesterday', as appropriate.
   * Otherwise, format the date using the passed in format string.
   *
   * Examples (when 'today' is 17 Feb 2007):
   * 16 Feb 2007 becomes yesterday.
   * 17 Feb 2007 becomes today.
   * 18 Feb 2007 becomes tomorrow.
   * Any other day is formatted according to given argument or the DATE_FORMAT setting if no argument is given.
   */
  humanize.naturalDay = function(timestamp, format) {
    timestamp = (timestamp === undefined) ? humanize.time() : timestamp;
    format = (format === undefined) ? 'Y-m-d' : format;

    var oneDay = 86400;
    var d = new Date();
    var today = (new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime() / 1000;

    if (timestamp < today && timestamp >= today - oneDay) {
      return 'yesterday';
    } else if (timestamp >= today && timestamp < today + oneDay) {
      return 'today';
    } else if (timestamp >= today + oneDay && timestamp < today + 2 * oneDay) {
      return 'tomorrow';
    }

    return humanize.date(format, timestamp);
  };

  /**
   * returns a string representing how many seconds, minutes or hours ago it was or will be in the future
   * Will always return a relative time, most granular of seconds to least granular of years. See unit tests for more details
   */
  humanize.relativeTime = function(timestamp) {
    timestamp = (timestamp === undefined) ? humanize.time() : timestamp;

    var currTime = humanize.time();
    var timeDiff = currTime - timestamp;

    // within 2 seconds
    if (timeDiff < 2 && timeDiff > -2) {
      return (timeDiff >= 0 ? 'just ' : '') + 'now';
    }

    // within a minute
    if (timeDiff < 60 && timeDiff > -60) {
      return (timeDiff >= 0 ? Math.floor(timeDiff) + ' seconds ago' : 'in ' + Math.floor(-timeDiff) + ' seconds');
    }

    // within 2 minutes
    if (timeDiff < 120 && timeDiff > -120) {
      return (timeDiff >= 0 ? 'about a minute ago' : 'in about a minute');
    }

    // within an hour
    if (timeDiff < 3600 && timeDiff > -3600) {
      return (timeDiff >= 0 ? Math.floor(timeDiff / 60) + ' minutes ago' : 'in ' + Math.floor(-timeDiff / 60) + ' minutes');
    }

    // within 2 hours
    if (timeDiff < 7200 && timeDiff > -7200) {
      return (timeDiff >= 0 ? 'about an hour ago' : 'in about an hour');
    }

    // within 24 hours
    if (timeDiff < 86400 && timeDiff > -86400) {
      return (timeDiff >= 0 ? Math.floor(timeDiff / 3600) + ' hours ago' : 'in ' + Math.floor(-timeDiff / 3600) + ' hours');
    }

    // within 2 days
    var days2 = 2 * 86400;
    if (timeDiff < days2 && timeDiff > -days2) {
      return (timeDiff >= 0 ? '1 day ago' : 'in 1 day');
    }

    // within 29 days
    var days29 = 29 * 86400;
    if (timeDiff < days29 && timeDiff > -days29) {
      return (timeDiff >= 0 ? Math.floor(timeDiff / 86400) + ' days ago' : 'in ' + Math.floor(-timeDiff / 86400) + ' days');
    }

    // within 60 days
    var days60 = 60 * 86400;
    if (timeDiff < days60 && timeDiff > -days60) {
      return (timeDiff >= 0 ? 'about a month ago' : 'in about a month');
    }

    var currTimeYears = parseInt(humanize.date('Y', currTime), 10);
    var timestampYears = parseInt(humanize.date('Y', timestamp), 10);
    var currTimeMonths = currTimeYears * 12 + parseInt(humanize.date('n', currTime), 10);
    var timestampMonths = timestampYears * 12 + parseInt(humanize.date('n', timestamp), 10);

    // within a year
    var monthDiff = currTimeMonths - timestampMonths;
    if (monthDiff < 12 && monthDiff > -12) {
      return (monthDiff >= 0 ? monthDiff + ' months ago' : 'in ' + (-monthDiff) + ' months');
    }

    var yearDiff = currTimeYears - timestampYears;
    if (yearDiff < 2 && yearDiff > -2) {
      return (yearDiff >= 0 ? 'a year ago' : 'in a year');
    }

    return (yearDiff >= 0 ? yearDiff + ' years ago' : 'in ' + (-yearDiff) + ' years');
  };

  /**
   * Converts an integer to its ordinal as a string.
   *
   * 1 becomes 1st
   * 2 becomes 2nd
   * 3 becomes 3rd etc
   */
  humanize.ordinal = function(number) {
    number = parseInt(number, 10);
    number = isNaN(number) ? 0 : number;
    var sign = number < 0 ? '-' : '';
    number = Math.abs(number);
    var tens = number % 100;

    return sign + number + (tens > 4 && tens < 21 ? 'th' : {1: 'st', 2: 'nd', 3: 'rd'}[number % 10] || 'th');
  };

  /**
   * Formats the value like a 'human-readable' file size (i.e. '13 KB', '4.1 MB', '102 bytes', etc).
   *
   * For example:
   * If value is 123456789, the output would be 117.7 MB.
   */
  humanize.filesize = function(filesize, kilo, decimals, decPoint, thousandsSep, suffixSep) {
    kilo = (kilo === undefined) ? 1024 : kilo;
    if (filesize <= 0) { return '0 bytes'; }
    if (filesize < kilo && decimals === undefined) { decimals = 0; }
    if (suffixSep === undefined) { suffixSep = ' '; }
    return humanize.intword(filesize, ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'], kilo, decimals, decPoint, thousandsSep, suffixSep);
  };

  /**
   * Formats the value like a 'human-readable' number (i.e. '13 K', '4.1 M', '102', etc).
   *
   * For example:
   * If value is 123456789, the output would be 117.7 M.
   */
  humanize.intword = function(number, units, kilo, decimals, decPoint, thousandsSep, suffixSep) {
    var humanized, unit;

    units = units || ['', 'K', 'M', 'B', 'T'],
    unit = units.length - 1,
    kilo = kilo || 1000,
    decimals = isNaN(decimals) ? 2 : Math.abs(decimals),
    decPoint = decPoint || '.',
    thousandsSep = thousandsSep || ',',
    suffixSep = suffixSep || '';

    for (var i=0; i < units.length; i++) {
      if (number < Math.pow(kilo, i+1)) {
        unit = i;
        break;
      }
    }
    humanized = number / Math.pow(kilo, unit);

    var suffix = units[unit] ? suffixSep + units[unit] : '';
    return humanize.numberFormat(humanized, decimals, decPoint, thousandsSep) + suffix;
  };

  /**
   * Replaces line breaks in plain text with appropriate HTML
   * A single newline becomes an HTML line break (<br />) and a new line followed by a blank line becomes a paragraph break (</p>).
   * 
   * For example:
   * If value is Joel\nis a\n\nslug, the output will be <p>Joel<br />is a</p><p>slug</p>
   */
  humanize.linebreaks = function(str) {
    // remove beginning and ending newlines
    str = str.replace(/^([\n|\r]*)/, '');
    str = str.replace(/([\n|\r]*)$/, '');

    // normalize all to \n
    str = str.replace(/(\r\n|\n|\r)/g, "\n");

    // any consecutive new lines more than 2 gets turned into p tags
    str = str.replace(/(\n{2,})/g, '</p><p>');

    // any that are singletons get turned into br
    str = str.replace(/\n/g, '<br />');
    return '<p>' + str + '</p>';
  };

  /**
   * Converts all newlines in a piece of plain text to HTML line breaks (<br />).
   */
  humanize.nl2br = function(str) {
    return str.replace(/(\r\n|\n|\r)/g, '<br />');
  };

  /**
   * Truncates a string if it is longer than the specified number of characters.
   * Truncated strings will end with a translatable ellipsis sequence ('…').
   */
  humanize.truncatechars = function(string, length) {
    if (string.length <= length) { return string; }
    return string.substr(0, length) + '…';
  };

  /**
   * Truncates a string after a certain number of words.
   * Newlines within the string will be removed.
   */
  humanize.truncatewords = function(string, numWords) {
    var words = string.split(' ');
    if (words.length < numWords) { return string; }
    return words.slice(0, numWords).join(' ') + '…';
  };

}).call(this);

(function( angular ) {
  'use strict';

  angular.module('angular-humanize', []).
    filter('humanizeFilesize', function () {
      return function ( input ) {
        if ( isNaN(parseInt(input)) ) { return input; }
        return humanize.filesize(parseInt(input));
      };
    }).
    filter('humanizeOrdinal', function () {
      return function ( input ) {
        if ( parseInt(input) !== input ) { return input; }
        return humanize.ordinal(input);
      };
    }).
    filter('humanizeNaturalDay', function () {
      return function ( input ) {
        if ( parseInt(input) !== input ) { return input; }
        return humanize.naturalDay(input);
      };
    }).
    filter('humanizeRelativeTime', function () {
      return function ( input ) {
        if ( parseInt(input) !== input ) { return input; }
        return humanize.relativeTime(input);
      };
    });

}( angular ));

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


/**
 * Created by supostat on 05.11.15.
 */

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        tinyMCE.baseURL = '/js/tinymce-dist';
        tinyMCE.PluginManager.load('equationeditor', '/js/tinymce-dist/plugins/equation/plugin.min.js');
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home-page', {
                url: '/',
                templateUrl: '/templates/admin/home-page.tpl.html',
                //controller: 'HomePageController',
                ncyBreadcrumb: {
                    label: 'Home'
                }
            })
            .state('users', {
                url: '/users',
                templateUrl: '/templates/admin/users-list.tpl.html',
                controller: 'UsersListController',
                ncyBreadcrumb: {
                    label: 'Registered users list'
                }
            })
            .state('admins', {
                url: '/admins',
                templateUrl: '/templates/admin/admins/admins-index.tpl.html',
                controller: 'AdminsController',
                ncyBreadcrumb: {
                    label: 'Admins'
                }
            })
            .state('cms', {
                url: '/cms',
                templateUrl: '/templates/admin/cms/cms-index.tpl.html',
                controller: 'CmsController',
                ncyBreadcrumb: {
                    label: 'Cms'
                }
            })
            .state('cms.edit', {
                url: '/edit/:page_id',
                views: {
                    '@': {
                        templateUrl: '/templates/admin/cms/cms-edit.tpl.html',
                        controller: 'CmsEditController',

                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit: {{page_name}}'
                }
            })
            .state('quiz-preview', {
                url: '/quiz-preview/:quiz_id',
                templateUrl: '/templates/admin/quiz-preview.tpl.html',
                controller: 'QuizPreviewController',
                ncyBreadcrumb: {
                    label: 'Quiz preview'
                }
            })
            .state('videos', {
                url: '/videos',
                templateUrl: '/templates/admin/Video/video-index.tpl.html',
                controller: 'AdminVideoController',
                ncyBreadcrumb: {
                    label: 'Videos'
                }
            })
            .state('system-settings', {
                url: '/system-settings',
                templateUrl: '/templates/admin/system-settings.tpl.html',
                controller: 'SystemSettingsController',
                ncyBreadcrumb: {
                    label: 'System settings'
                }
            })
            .state('profile-settings', {
                url: '/profile-settings',
                templateUrl: '/templates/admin/profile-settings/profile-settings.tpl.html',
                controller: 'ProfileSettingsController',
                ncyBreadcrumb: {
                    label: 'Profile settings'
                }
            })
            .state('system-settings.student-subscriptions-settings', {
                url: '/student-subscriptions',
                views: {
                    'system-settings@system-settings': {
                        templateUrl: '/templates/admin/system-settings/student-subscriptions.tpl.html',
                        controller: 'StudentSubscriptionsSettingsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Student subscriptions settings'
                }
            })
            .state('system-settings.tutor-subscriptions-settings', {
                url: '/tutor-subscriptions',
                views: {
                    'system-settings@system-settings': {
                        templateUrl: '/templates/admin/system-settings/tutor-subscriptions.tpl.html',
                        controller: 'TutorSubscriptionsSettingsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Tutor subscriptions settings'
                }
            })
            .state('system-settings.mobile-money-settings', {
                url: '/mobile-money',
                views: {
                    'system-settings@system-settings': {
                        templateUrl: '/templates/admin/system-settings/mobile-money.tpl.html',
                        controller: 'MobileMoneySettingsController',
                    }
                },
                ncyBreadcrumb: {
                    label: 'Mobile money settings'
                }
            })
            .state('examIndex', {
                url: '/exam',
                templateUrl: '/templates/exam/exam-index.tpl.html',
                controller: 'ExamTypeController',
                ncyBreadcrumb: {
                    label: 'Exam types'
                }
            })
            .state('examIndex.exam', {
                url: '/:exam_id',
                views: {
                    '@': {
                        templateUrl: '/templates/exam/exam-show.tpl.html',
                        controller: 'ExamTypeEditController'
                    },
                    'subjects@examIndex.exam': {
                        templateUrl: '/templates/subject/subject-list.tpl.html',
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
                        templateUrl: '/templates/subject/subject-show.tpl.html',
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
                        templateUrl: '/templates/topic/topic-list.tpl.html',
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
                        templateUrl: '/templates/subtopic/subtopic-list.tpl.html',
                        controller: 'SubTopicListCtrl'
                    }
                },
                ncyBreadcrumb: {
                    label: 'SubTopics',
                }
            })
            .state('examIndex.exam.subjectShow.video', {
                url: '/video',
                templateUrl: '/templates/video/subject-video-index.tpl.html',
                ncyBreadcrumb: {
                    label: 'Video'
                },
            })
            .state('examIndex.exam.subjectShow.quizzes', {
                url: '/quizzes',
                controller: 'QuizzesController',
                templateUrl: '/templates/quiz/subject-quiz-index.tpl.html',
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
                        templateUrl: '/templates/quiz/subject-quiz-create.tpl.html',
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
                        templateUrl: '/templates/quiz/subject-quiz-edit.tpl.html',
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
                        templateUrl: '/templates/question/subject-quiz-question-index.tpl.html',
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
                        templateUrl: '/templates/question/subject-quiz-question-new.tpl.html',
                        controller: 'QuestionCreateController'
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                    'topic@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/templates/topic/topic-dropdown.tpl.html',
                        controller: 'TopicListController'
                    },
                    'subtopic@examIndex.exam.subjectShow.quizzes.question.create': {
                        templateUrl: '/templates/subtopic/subtopic-dropdown.tpl.html',
                        controller: 'SubTopicDropdownController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.section', {
                url: '/section/:section_id/create',
                views: {
                    '@': {
                        templateUrl: '/templates/question/subject-quiz-question-new.tpl.html',
                        controller: 'QuestionCreateController'
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.section': {
                        templateUrl: '/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                    'topic@examIndex.exam.subjectShow.quizzes.question.section': {
                        templateUrl: '/templates/topic/topic-dropdown.tpl.html',
                        controller: 'TopicListController'
                    },
                    'subtopic@examIndex.exam.subjectShow.quizzes.question.section': {
                        templateUrl: '/templates/subtopic/subtopic-dropdown.tpl.html',
                        controller: 'SubTopicDropdownController'
                    }
                },
                ncyBreadcrumb: {
                    label: 'New in section'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.sectionedit', {
                url: '/section/:section_id/edit/:question_id',
                views: {
                    '@': {
                        templateUrl: '/templates/question/subject-quiz-question-edit.tpl.html',
                        controller: 'QuestionsUpdateController',
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.sectionedit': {
                        templateUrl: '/templates/answer/subject-quiz-answer-index.tpl.html',
                        controller: 'AnswersController',
                    },
                },
                ncyBreadcrumb: {
                    label: 'Edit'
                }
            })
            .state('examIndex.exam.subjectShow.quizzes.question.edit', {
                url: '/edit/:question_id',
                views: {
                    '@': {
                        templateUrl: '/templates/question/subject-quiz-question-edit.tpl.html',
                        controller: 'QuestionsUpdateController',
                    },
                    'answers@examIndex.exam.subjectShow.quizzes.question.edit': {
                        templateUrl: '/templates/answer/subject-quiz-answer-index.tpl.html',
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


        //var updateAnswer = function (answer) {
        //    AnswersModel.update(answer.id, answer).then(function (result) {
        //    });
        //};


        function checkName(index) {
            if ($scope.answers[index].content.trim() == '') {
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

app.controller('ExamTypeController', ['$http', '$scope', 'ExamsModel', '$rootScope', 'ngDialog', 'User',
    function ($http, $scope, ExamsModel, $rootScope, ngDialog, User) {

        function getExams() {
            User.isAdmin().then(function (result) {
                $scope.isAdmin = result.data;
            });

            ExamsModel.all().then(function (result) {
                $scope.exams = result.data.data;
                $scope.title = result.data.type == 2 ? 'Grade level' : 'Exam type';
            });
        }

        function checkFree(exam) {
            exam.free = !exam.free;
            ExamsModel.checkFree(exam.id).then(function (result) {
            })
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

        function deleteExam(exam) {

            $scope.deletedExamtype = exam;

            ngDialog.openConfirm({
                template: 'templateExamtype',
                scope: $scope,
                showClose: false
            }).then(function (examtype_id) {
                ExamsModel.destroy(examtype_id)
                    .then(function (result) {
                        getExams();
                    });
            });

        };

        $scope.saveOrder = function () {
            var data = [];

            angular.forEach($scope.sortedModel, function (value, key) {
                data.push({id: value.id, order: key});
            });
            ExamsModel.saveOrder(data).then(function (result) {
                if (result) {
                    $scope.sorted = false;
                }
            })
        };

        $scope.sortConfig = {
            animation: 150,
            handle: ".sorting-handle",
            onSort: function (/** ngSortEvent */evt) {
                $scope.sorted = true;
                $scope.sortedModel = evt.models;
            }
        };
        
        $scope.sorted = false;
        $scope.sortedModel = [];


        $scope.exams = [];
        $scope.newExam = {};
        $scope.isAdmin = false;

        $scope.deletedExamtype = {};
        $scope.deleteExam = deleteExam;
        $scope.createExam = createExam;
        $scope.updateExam = updateExam;
        $scope.checkFree = checkFree;

        $scope.title = null;

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
app.controller('MenuController', ['$scope', 'UsersModel', function ($scope, UsersModel) {

    UsersModel.getRequestsCount().success(function (result) {
        $scope.requestsCount = result;
    });

    UsersModel.getTutorStudentsCount().success(function (result) {
        $scope.studentsCount = result;
    });


    $scope.requestsCount = 0;
    $scope.studentsCount = 0;
}]);
app.controller('ProfileSettingsController', ['$scope', '$http', 'Notification', 'ENDPOINT_URI',
    function ($scope, $http, Notification, ENDPOINT_URI) {

        $scope.changePassword = function (password) {
            $scope.btnDisabled = true;
            $http.post(ENDPOINT_URI + 'users/changePassword', password).then(function (response) {
                $scope.btnDisabled = false;
                Notification.success({
                    message: 'Successfully updated',
                    title: 'Password'
                });
            }, function (response) {
                $scope.btnDisabled = false;
                Notification.error({
                    message: response.data.message,
                    title: 'Password'
                });
            });
        };

        $scope.getDisabled = function (password) {
            if($scope.frmChangePassword.$invalid) {
                return true;
            }
            if(password.newPassword != '' && (password.newPassword != password.confirmNewPassword)) {
                return true;
            }
            if($scope.btnDisabled) {
                return true;
            }

            return false;
        };

        $scope.password = {};
        $scope.password.newPassword = '';
        $scope.password.confirmNewPassword = '';
        $scope.btnDisabled = false;

    }]);
/**
 * Created by supostat on 28.12.15.
 */


app.controller('ProfileController', ['$scope', '$http', 'UsersModel', 'Notification', 'SubjectsModel', 'ngDialog', '$window',
    function ($scope, $http, UsersModel, Notification, SubjectsModel, ngDialog, $window) {

        function sexSelect(sex) {
            $scope.user.sex = sex.id;
        }

        function getAvatarSrc() {
            if($scope.user) {
                if($scope.user.avatar) return $scope.user.avatar.thumb;
                if($scope.user.sex == 1) return '/images/nophoto-male.jpg';
                if($scope.user.sex == 0) return '/images/nophoto-female.jpg';
            }
        }

        function getUserData() {
            UsersModel.getCurrentUser().then(function (result) {
                for (var i in $scope.statuses) {
                    if ($scope.statuses[i].id == result.data.status) {
                        result.data.status = $scope.statuses[i];
                    }
                }
                $scope.visualDate = moment(result.data.dateBirth).isValid()?moment(result.data.dateBirth).format('LL'):'';
                if(result.data.sex != null) {
                    $scope.sexVisual = $scope.sexs[result.data.sex];
                }
                if(!result.data.avatar) {
                    if(!result.data.sex) {
                        result.data.sex = $scope.sexs[0].id;
                        $scope.sexVisual = $scope.sexs[1];
                    }
                }
                $scope.user = result.data;
                if(!$scope.user.experience) $scope.user.experience = 0;
                getSubjectsList();
            })
        }

        $scope.uploadAvatar = function (file) {
            if(file) {
                $scope.file = file;
                ngDialog.openConfirm({
                    template: '/templates/dialogs/cropavatar.html',
                    scope: $scope,
                    className: 'ngdialog-theme-default cropAvatarDialog'
                }).then(function (file) {
                    $scope.user.avatar = file;
                });
            }
        };

        function saveProfile() {

            var user = angular.copy($scope.user);
            user.status = user.status.id;
            user.dateBirth = moment(user.dateBirth).format('YYYY-MM-DD HH:mm:ss');
            user.avatar = $scope.user.avatar;
            user.tutorSubjects = $scope.tutorSubjects;
            user.coordinates = $scope.coordinates;
            UsersModel.saveProfile(user).then(function (result) {
                if (result.data) {
                    Notification.success({
                        message: 'Update complete',
                        title: 'Update'
                    });
                } else {
                    Notification.error({
                        message: 'Error',
                        title: 'Update'
                    });
                }
            })
        }

        function toggleSubjects(subject) {
            console.log(subject);
        }

        function getSubjectsList() {
            SubjectsModel.getSubjectsList().then(function (result) {
                $scope.subjects = result.data;
                for(var i in $scope.subjects) {
                    for(var j in $scope.user.subjects) {
                        if($scope.subjects[i].id == $scope.user.subjects[j].id) {
                            $scope.subjects[i].selected = true;
                            $scope.tutorSubjects.push($scope.user.subjects[j].id);
                        }
                    }
                }
            });
        }

        $scope.selected = function (cords) {
            $scope.coordinates = cords;
            var scale;
            $scope.picWidth = cords.w;
            $scope.picHeight = cords.h;

            if ($scope.picWidth > 200) {
                scale = (200 / $scope.picWidth);
                $scope.picHeight *= scale;
                $scope.picWidth *= scale;
            }

            if ($scope.picHeight > 200) {
                scale = (200 / $scope.picHeight);
                $scope.picHeight *= scale;
                $scope.picWidth *= scale;
            }

            $scope.cropped = true;

            var rx = 200 / cords.w,
                ry = 200 / cords.h;

            $window.jQuery('img#preview').css({
                width: Math.round(rx * cords.bx) + 'px',
                height: Math.round(ry * cords.by) + 'px',
                marginLeft: '-' + Math.round(rx * cords.x) + 'px',
                marginTop: '-' + Math.round(ry * cords.y) + 'px'
            });
        };

        $scope.onBirthSet = function (newDate) {
            $scope.visualDate = moment(newDate).format('LL');
        };

        $scope.$watch('sexVisual', function (sex) {
            if(sex) {
                $scope.user.sex = sex.id;
            }
        });

        $scope.$watch('subjects|filter:{selected:true}', function (nv) {
            $scope.tutorSubjects = nv.map(function (subject) {
                return subject.id;
            });
        }, true);

        $scope.user = {};
        $scope.visualDate = null;
        $scope.sex = {};
        $scope.sexs = [{id: 0, value: 'Female'},{id: 1, value: 'Male'}];
        $scope.statuses = [{id: 1, value: 'Accepting students'}, {id: 0, value: 'Not Accepting students'}];
        $scope.sexSelect = sexSelect;
        $scope.saveProfile = saveProfile;
        $scope.toggleSubjects = toggleSubjects;
        $scope.getAvatarSrc = getAvatarSrc;
        $scope.subjects = [];
        $scope.tutorSubjects = [];


        getUserData();
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

app.controller('QuestionCreateController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'QuestionsModel',
    'AnswersModel', 'SubtopicsModel', 'TopicsModel', 'Upload', '$timeout',
    function ($http, $scope, $stateParams, $state, QuestionsService, QuestionsModel, AnswersModel, SubtopicsModel, TopicsModel, Upload, $timeout) {

        var quiz_id = $stateParams.quiz_id;
        var section_id = $stateParams.section_id;

        function saveQuestion() {
            var data = {
                question: {
                    content: $scope.question.content,
                    topic_id: !$scope.selectedTopic ? '' : $scope.selectedTopic.id,
                    subtopic_id: !$scope.selectedSubTopic ? '' : $scope.selectedSubTopic.id,
                    quize_id: quiz_id,
                    section_id: section_id ? section_id : '',
                    essay: $scope.essay,
                    sample_essay: $scope.question.sample_essay
                },
                files: $scope.files
            };
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

        $scope.removeImage = function (file) {
            angular.forEach($scope.files, function (value, key) {
                if ($scope.files[key] == file) {
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
            //setup: function (ed) {
            //    ed.on('init', function (args) {
            //        $('.mce-edit-area').writemaths({iFrame: true});
            //    });
            //},
            resize: false,
            height: 300,
            plugins: "tiny_mce_wiris",
            toolbar: "tiny_mce_wiris_formulaEditor"
        };

        getTopics();

        $scope.saveQuestion = saveQuestion;
        $scope.selectedTopic = null;
        $scope.selectedSubTopic = null;
        $scope.essay = 0;
    }
]);
/**
 * Created by supostat on 05.11.15.
 */



app.controller('QuestionsController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsModel', 'SectionsModel', 'ngDialog',
    function ($http, $scope, $stateParams, $state, QuestionsModel, SectionsModel, ngDialog) {

        var quiz_id = $stateParams.quiz_id;
        function getQuestions() {
            QuestionsModel.all(quiz_id).then(function (result) {
                if (result.data == false) {
                    $scope.isEmptyQuestions = true;
                } else {
                    $scope.isEmptyQuestions = false;
                }
                $scope.questions = result.data;
                if(result.data.length <= 10) {
                    $scope.showPagination = false;
                } else {
                    $scope.showPagination = true;
                }
                $scope.filteredQuestions = $scope.questions.slice(0, 10);
            });
        }

        function getSections() {
            SectionsModel.all($stateParams.quiz_id).then(function (result) {
                $scope.sections = result.data;
            })
        }

        function addSection() {
            var section = {
                'quiz_id': $stateParams.quiz_id
            };
            SectionsModel.create(section).then(function (result) {
                $scope.sections.push(result.data);
            });
        }

        function deleteSection(index) {
            $scope.deletedSection = $scope.sections[index];
            var sectionIndex = index;

            ngDialog.openConfirm({
                template: 'templateSection',
                scope: $scope,
                showClose: false
            }).then(function (section_id) {
                SectionsModel.destroy(section_id).then(function () {
                    $scope.sections.splice(sectionIndex, 1);
                })
            });
        }

        function deleteQuestion(question) {
            $scope.deletedQuestion = question;

            ngDialog.openConfirm({
                template: 'templateQuestion',
                scope: $scope,
                showClose: false
            }).then(function (question_id) {
                QuestionsModel.destroy(question_id).then(function (result) {
                    if ($scope.questions == false) {
                        $scope.isEmptyQuestions = true;
                    } else {
                        $scope.isEmptyQuestions = false;
                    }
                    getQuestions();
                })
            });
        }

        function deleteSectionQuestion(question) {
            var sections = $scope.sections;

            $scope.deletedQuestion = question;

            ngDialog.openConfirm({
                template: 'templateQuestion',
                scope: $scope,
                showClose: false
            }).then(function (question_id) {
                QuestionsModel.destroy(question_id).then(function (result) {
                    angular.forEach(sections, function (item, index) {
                        var section_index = index;
                        angular.forEach(item.questions, function (item, index) {
                            if(item.id == question.id) {
                                $scope.sections[section_index].questions.splice(index, 1);
                            }
                        })
                    });
                })
            });
        }

        function updateDescription(section) {
            SectionsModel.update(section.id, section).then(function (result) {
            });
        }

        /**
         * Pagination scope
         */
        $scope.currentPage = 1;
        $scope.maxSize = 5;
        $scope.numPerPage = 10;

        $scope.questions = [];
        $scope.sections = [];
        $scope.sectionQuestions = [];
        $scope.isEmptyQuestions = false;
        $scope.deleteQuestion = deleteQuestion;
        $scope.addSection = addSection;
        $scope.deleteSection = deleteSection;
        $scope.updateDescription = updateDescription;
        $scope.deleteSectionQuestion = deleteSectionQuestion;
        $scope.showPagination = false;

        $scope.deletedQuestion = {};
        $scope.deletedSection = {};

        $scope.$watch('currentPage + numPerPage', function() {
            var begin = (($scope.currentPage - 1) * $scope.numPerPage);
            var end = begin + $scope.numPerPage;
            $scope.filteredQuestions = $scope.questions.slice(begin, end);
        });

        getSections();
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
        var section_id = $stateParams.section_id;

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
        $scope.essay = 0;

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
app.controller('ProfileViewController', ['$scope', '$stateParams',
    function ($scope, $stateParams) {

        function getStudent() {

        }

        $scope.id = $stateParams.id;
        $scope.student = {};

        $scope.getStudent = getStudent;
    }
]);
/**
 * Created by supostat on 20.01.16.
 */

app.controller('SearchForStudentsController', ['$scope', 'StudentsModel',  function ($scope, StudentsModel) {

    $scope.view = '/templates/views/students-list.html';

    function getStudentsList() {
        StudentsModel.getStudentsList().then(function (result) {
            console.log(result);
            $scope.students = result.data;
        })
    }

    getStudentsList();
}]);
/**
 * Created by supostat on 15.12.15.
 */


app.controller("StudentController", ['$scope', function ($scope) {

}]);
app.controller('TutorStudentsController', ['$scope', 'TutorsModel', '$state',
    function ($scope, TutorsModel, $state) {

        $scope.view = '/templates/views/students-list.html';

        $scope.views = [{
            name: 'List',
            template: '/templates/views/students-list.html',
            icon: 'btn btn-default navbar-btn fa fa-list'
        }, {
            name: 'Grid',
            template: '/templates/views/students-grid.html',
            icon: 'btn btn-default navbar-btn fa fa-th'
        }];

        $scope.numPerPage = 5;
        $scope.currentPage = 1;

        $scope.pageChanged = function (currentPage) {
            var begin = ((currentPage - 1) * $scope.numPerPage);
            var end = begin + $scope.numPerPage;
            $scope.filteredStudents = $scope.students.slice(begin, end);
        };

        function getAvatarSrc(student) {
            if(student.avatar) return student.avatar.thumb;
            if(student.sex == 1) return '/images/nophoto-male.jpg';
            if(student.sex == 0) return '/images/nophoto-female.jpg';
        }

        function getStudents() {
            TutorsModel.getStudentsList().then(function (result) {
                $scope.students = result.data;
                $scope.filteredStudents = $scope.students.slice(0, 5);
            })
        }

        $scope.viewProfile = function (student) {
            return 'tutorStudents.student({id: student.id})';
        };

        $scope.students = [];
        $scope.getAvatarSrc = getAvatarSrc;
        getStudents();
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

app.controller('SubTopicListCtrl', ['$http', '$scope', '$stateParams', '$state', 'SubtopicsModel', 'QuestionsService', 'ngDialog',
    function ($http, $scope, $stateParams, $state, SubtopicsModel, QuestionsService, ngDialog) {
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

    $scope.createSubTopic = function (isValid) {
        if(!isValid) return false;

        $scope.subtopicform.$setPristine();

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

        $scope.deletedSubtopic = $scope.subtopics[id];

        ngDialog.openConfirm({
            template: 'templateSubtopic',
            scope: $scope,
            showClose: false
        }).then(function (subtopic_id) {
            $http.delete('/v1/subtopic/delete?id=' + subtopic_id).
                success(function () {
                    $scope.subtopics.splice(id, 1);
                    if ($scope.subtopics == false) {
                        $scope.isEmptySubTopics = true;
                    } else {
                        $scope.isEmptySubTopics = false;
                    }
                });
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

    $scope.deletedSubtopic = {};

    getSubtopics();
}
]);
app.controller('TutorsRequestsController', ['$scope', 'TutorsModel', 'ngDialog',
    function ($scope, TutorsModel, ngDialog) {
        $scope.requests = [];

        function getRequests() {
            TutorsModel.getStudentsRequests().then(function (result) {
                $scope.requests = result.data;
            });
        }

        function acceptRequest(request) {
            $scope.request = request;
            ngDialog.openConfirm({
                scope: $scope,
                template: '/templates/dialogs/acceptRequest.html'
            }).then(function (request) {
                var data = {
                    id: request.student.id
                };
                TutorsModel.acceptRequest(data).then(function () {
                    for (var i in $scope.requests) {
                        if ($scope.requests[i].id == request.id) {
                            $scope.requests.splice(i, 1);
                        }
                    }
                });
            })
        }

        function rejectRequest(request) {
            $scope.request = request;
            ngDialog.openConfirm({
                scope: $scope,
                template: '/templates/dialogs/rejectRequest.html',
            }).then(function (request) {
                var data = {
                    id: request.student.id
                };
                TutorsModel.rejectRequest(data).then(function () {
                    for (var i in $scope.requests) {
                        if ($scope.requests[i].id == request.id) {
                            $scope.requests.splice(i, 1);
                        }
                    }
                });
            })
        }

        $scope.acceptRequest = acceptRequest;
        $scope.rejectRequest = rejectRequest;
        $scope.request = {};
        getRequests();
    }]);
/**
 * Created by igorpugachev on 15.04.16.
 */

app.controller('QuizPreviewController', ['$scope', '$http', '$stateParams', 'ENDPOINT_URI',
    function ($scope, $http, $stateParams, ENDPOINT_URI) {
        var showQuestions = function () {
            var id = $stateParams.quiz_id;

            $http.get(ENDPOINT_URI + 'quizes/previewQuiz/' + id).then(function (response) {
               $scope.practice = response.data;
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                MathJax.Hub.Queue(function () {
                    $('#practice').css('opacity', 1);
                });
            });
        };

        showQuestions()

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
        console.log('asfafs');
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
                            if (status == 422) {
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
            $state.go('.question', {quiz_id: quiz_id});
        }

        $scope.subject_id = subject_id;
        $scope.quizzes = [];

        $scope.sortConfig = {
            animation: 150,
            handle: ".sorting-handle",
            onSort: function (/** ngSortEvent */evt){
                $scope.sorted = true;
                $scope.sortedModel = evt.models;
            }
        };

        $scope.saveOrder = function () {
            var data = [];

            angular.forEach($scope.sortedModel, function (value, key) {
                data.push({id: value.id, order: key});
            });
            QuizzesModel.saveOrder(data).then(function (result) {
                if(result) {
                    $scope.sorted = false;
                }
            })
        };

        $scope.sorted = false;
        $scope.sortedModel = [];

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
            active: $scope.quiz.active,
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
 * Created by supostat on 02.11.15.
 */

app.controller('SubjectsController', ['$http', '$scope', '$state', '$stateParams', 'SubjectsModel', 'ngDialog',
    function ($http, $scope, $state, $stateParams, SubjectsModel, ngDialog) {

        var exam_id = $stateParams.exam_id;

        function getOriginList() {
            SubjectsModel.getOriginList(exam_id).then(function (result) {
                if (result.data == false) {
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
                if (result.data == false) {
                    $scope.isEmptySubjects = true;
                } else {
                    $scope.isEmptySubjects = false;
                }
                $scope.subjects = result.data;
            });
        }

        function createSubject(subject) {
            SubjectsModel.create(subject).then(function (result) {
                $scope.newSubject = null;
                getOriginList();
            })
        }

        $scope.sortConfig = {
            animation: 150,
            handle: ".sorting-handle",
            onSort: function (/** ngSortEvent */evt) {
                $scope.sorted = true;
                $scope.sortedModel = evt.models;
            }
        };

        function addSubject(subject) {
            var selectedSubject = {
                name: subject.name,
                subject_origin_id: subject.id,
                examtype_id: $stateParams.exam_id
            };
            SubjectsModel.add(selectedSubject)
                .then(function (result) {
                    getSubjects();
                    getOriginList();
                });
        }



        function deleteSubject(subject) {
            SubjectsModel.destroy(subject.id)
                .then(function (result) {
                    //getSubjects();
                    getOriginList();
                });
        }


        function removeSubject(subject) {
            $scope.deletedSubject = subject;

            ngDialog.openConfirm({
                template: 'templateSubject',
                scope: $scope,
                showClose: false
            }).then(function (subject_id) {
                SubjectsModel.remove(subject_id)
                    .then(function (result) {
                        getSubjects();
                        getOriginList();
                    });
            });

        }

        function showTopics(subject_id, e) {
            if ($(e.target).is('td')) {
                $(e.target).parent('tr').siblings().removeClass('active');
                $(e.target).parent('tr').addClass('active');
                $state.go('examIndex.exam.topic', {subject_id: subject_id});
            }
        };

        $scope.saveOrder = function () {
            var data = [];

            angular.forEach($scope.sortedModel, function (value, key) {
                data.push({id: value.id, order: key});
            });
            SubjectsModel.saveOrder(data).then(function (result) {
                if (result) {
                    $scope.sorted = false;
                }
            })
        };

        $scope.sorted = false;
        $scope.sortedModel = [];


        $scope.listOrigin = [];
        $scope.exam_id = exam_id;
        $scope.suffix = "Test breadcrumb";
        $scope.isEmptySubjects = false;
        $scope.isEmptyOriginSubjects = false;
        $scope.newSubject = {};

        $scope.createSubject = createSubject;
        $scope.addSubject = addSubject;
        $scope.removeSubject = removeSubject;
        $scope.deleteSubject = deleteSubject;
        $scope.showTopics = showTopics;
        $scope.deletedSubject = {};

        getSubjects();
        getOriginList();
    }
]);
/**
 * Created by supostat on 08.03.16.
 */


app.controller('MobileMoneySettingsController', ['$scope', 'ngDialog', '$http', 'ENDPOINT_URI',
    function ($scope, ngDialog, $http, ENDPOINT_URI) {
        var dialog_templates_path = '/templates/admin/dialogs/';

        function getCountries() {
            $http.get(ENDPOINT_URI + 'mm-country').then(function (result) {
                $scope.countries = result.data;
            })
        }

        getCountries();

        $scope.showAddCountryDialog = function () {
            $scope.edit = false;
            $scope.newCountry = {};
            $scope.newCountry.phones = [];
            ngDialog.openConfirm({
                template: dialog_templates_path + 'add-country.tpl.html',
                scope: $scope
            }).then(function (newCountry) {
                var phones = newCountry.phones.map(function (value) {
                    return value.number;
                }).join(',');

                var data = {
                    name: newCountry.name,
                    currency: newCountry.currency,
                    phones: phones
                };

                $http.post(ENDPOINT_URI + 'mm-country/create', data).then(function (result) {
                    $scope.countries.push(result.data);
                });
            });
        };

        $scope.deleteCountry = function (country) {
            $http.delete(ENDPOINT_URI + 'mm-country/delete?id=' + country.id).then(function () {
                getCountries();
            });
        };

        $scope.showEditCountryDialog = function (country) {
            $scope.edit = true;
            angular.copy(country, $scope.newCountry);

            $scope.newCountry.phones = country.phones ? country.phones.split(',').map(function (value) {
                return {number: value};
            }) : null;

            ngDialog.openConfirm({
                template: dialog_templates_path + 'add-country.tpl.html',
                scope: $scope
            }).then(function (newCountry) {
                var phones = newCountry.phones.map(function (value) {
                    return value.number;
                }).join(',');

                var data = {
                    id: newCountry.id,
                    name: newCountry.name,
                    currency: newCountry.currency,
                    phones: phones
                };

                $http.put(ENDPOINT_URI + 'mm-country/update', data).then(function (result) {
                    getCountries();
                });
            });
        };

        $scope.addPhoneNumber = function () {
            $scope.newCountry.phones.push({number: $scope.newCountry.number});
            $scope.newCountry.number = null;
        };

        $scope.edit = false;
        $scope.newCountry = {};
        $scope.newCountry.phones = [];
        $scope.countries = [];
    }
]);
/**
 * Created by supostat on 08.03.16.
 */

app.controller('StudentSubscriptionsSettingsController', ['$scope', '$rootScope',
    function ($scope, $rootScope) {

        $scope.recurringPeriod = [

        ];
    }
]);
/**
 * Created by supostat on 08.03.16.
 */


app.controller('SystemSettingsController', ['$scope', '$rootScope',
    function ($scope, $rootScope) {

    }
]);
/**
 * Created by supostat on 08.03.16.
 */

app.controller('TutorSubscriptionsSettingsController', ['$scope', 'ngDialog', '$http', 'ENDPOINT_URI', '$rootScope',
    function ($scope, ngDialog, $http, ENDPOINT_URI, $rootScope) {
        var $templates_path = '/templates/admin/dialogs/';
        var countries;

        function createSubscriptionPlan(plan) {
            $http.post(ENDPOINT_URI + 'subscription-plan/create', plan).then(function (result) {
                $scope.subscriptionPlans.push(result.data);
            })
        }

        function getSubscriotionPlansList() {
            $http.get(ENDPOINT_URI + 'subscription-plan').then(function (result) {
                $scope.subscriptionPlans = result.data;
            });
        }

        function updateSubscriptionPlan(plan, callback) {
            $http.put(ENDPOINT_URI + 'subscription-plan/update', plan).then(function (result) {
            });
        }

        $scope.setAmount = function () {
            $scope.editingPlan.amount = $scope.editingPlan.students_count * $rootScope.system.settings.amount_per_student;
        };

        $scope.editSubscriptionPlanDialog = function (plan) {
            $scope.editingPlan = plan;
            $scope.edit = true;
            ngDialog.openConfirm({
                template: $templates_path + 'create-subscription-plan.tpl.html',
                scope: $scope
            }).then(function (plan) {
                updateSubscriptionPlan(plan);
            });

        };

        $scope.deleteSubscriptionPlan = function (plan, index) {
            $http.delete(ENDPOINT_URI + 'subscription-plan/delete?id=' + plan.id).then(function (result) {
                if (result) {
                    $scope.subscriptionPlans.splice(index, 1);
                }
            });
        };

        $scope.openCreateSubscriptionPlanDialog = function () {
            $scope.editingPlan = {};
            $scope.editingPlan.countries = countries;
            $scope.edit = false;
            ngDialog.openConfirm({
                template: $templates_path + 'create-subscription-plan.tpl.html',
                scope: $scope
            }).then(function (plan) {
                createSubscriptionPlan(plan);
            });
        };

        $scope.editingPlan = {};
        $scope.subscriptionPlans = [];
        $scope.edit = false;
        $scope.countries = [];

        getSubscriotionPlansList();
    }
]);
/**
 * Created by supostat on 04.11.15.
 */

app.controller('TopicListController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'TopicsModel', 'SubtopicsModel', 'Test', 'ngDialog',
    function ($http, $scope, $stateParams, $state, QuestionsService, TopicsModel, SubtopicsModel, Test, ngDialog) {
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

        $scope.createTopic = function (validate) {
            if(!validate) return false;
            $scope.topicform.$setPristine();
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
                    $scope.newTopic = null;
                });
        };

        $scope.deleteTopic = function (id) {

            $scope.deletedTopic = $scope.topics[id];

            ngDialog.openConfirm({
                template: 'templateTopic',
                scope: $scope,
                showClose: false
            }).then(function (topic_id) {
                $http.delete('/v1/topic/delete?id=' + topic_id).
                    success(function () {
                        $state.go('examIndex.exam.topic', {subject_id: $stateParams.subject_id}, {reload: false});
                        QuestionsService.topics.list.splice(id, 1);
                        if ($scope.topics == false) {
                            $scope.isEmptyTopics = true;
                        } else {
                            $scope.isEmptyTopics = false;
                        }
                    });
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
app.controller('TutorStudentProfileController', ['$scope', '$stateParams', '$state', 'StudentsModel',
    function ($scope, $stateParams, $state, StudentsModel) {

        $scope.viewProfile = function (student) {
            console.log(student);
            $state.go('tutorStudents.student', {id: student.id});
        };

        function getAvatarSrc(student) {
            if(student.avatar) return student.avatar.thumb;
            if(student.sex == 1) return '/images/nophoto-male.jpg';
            if(student.sex == 0) return '/images/nophoto-female.jpg';
        }


        function getStudentData() {
            console.log($stateParams);
            StudentsModel.getStudent($stateParams.id).then(function (result) {
                console.log(result.data);
                $scope.student = result.data;
            })
        }

        $scope.student = {};
        $scope.getAvatarSrc = getAvatarSrc;

        getStudentData();
    }]);
app.controller('UsersListController', ['UsersListModel', '$scope', 'ngDialog', 'ENDPOINT_URI', '$http', '$rootScope', '$filter',
    function (UsersListModel, $scope, ngDialog, ENDPOINT_URI, $http, $rootScope, $filter) {
        var $templates_path = '/templates/admin/dialogs/';

        function giveManualSubscription(user, manualSubscription) {
            var data = {
                user: user,
                subscription: manualSubscription
            };

            $http.post(ENDPOINT_URI + 'subscriptions', data).then(function (result) {
                getUsersList();
            })
        }


        function getUsersList() {
            UsersListModel.getUsersList().then(function (result) {
                $scope.users = result.data.users;
                $scope.filteredUsers =  $filter('filter')($scope.users, {deleted: false});
                $scope.registered = {
                    'tutors': result.data.tutors,
                    'students': result.data.students,
                    'schools': result.data.schools,
                };
            });
        }

        getUsersList();
        $scope.giveManualSubscriptionDialog = function (user) {
            ngDialog.openConfirm({
                template: $templates_path + 'give-manual-student-subscription.tpl.html',
                scope: $scope,
                data: {
                    userTitle: user.user_type == 2 ? 'tutor' : 'student'
                }
            }).then(function (manualSubscription) {
                giveManualSubscription(user, manualSubscription);
            });
        };

        $scope.selectUserType = function (userType) {
            if (userType) {
                if (userType.id == 12) {
                    $scope.filteredUsers = $filter('filter')($scope.users, {deleted: true});
                } else {
                    $scope.filteredUsers = $filter('filter')($scope.users, {user_type: userType.id, deleted: false}, true);
                }
            } else {
                $scope.filteredUsers =  $filter('filter')($scope.users, {deleted: false});
            }
        };

        $scope.deleteUser = function (user, index) {
            $http.delete(ENDPOINT_URI + 'users/' + user.id).then(function (result) {
                user.deleted = true;
                $scope.filteredUsers =  $filter('filter')($scope.users, {deleted: false});
            });
        };
        $scope.restoreUser = function (user, index) {
            $http.post(ENDPOINT_URI + 'users/restore/' + user.id).then(function (result) {
                user.deleted = false;
                $scope.filteredUsers =  $filter('filter')($scope.users, {deleted: true});
            });
        };

        $scope.showUserSubscriptionDialog = function (user) {
            $http.get(ENDPOINT_URI + 'subscriptions/' + user.id).then(function (result) {
            });
        };

        $scope.userTypes = [
            {
                id: 1,
                name: 'Students'
            },
            {
                id: 2,
                name: 'Tutors'
            },
            {
                id: 11,
                name: 'Admins'
            },
            {
                id: 12,
                name: 'Deactivated'
            }
        ];
        $scope.filteredUsers = [];
        $scope.manualSubscription = {};
        $scope.manualSubscription.month = 1;
        $scope.users = [];
        $scope.subscribed = true;
    }]);

/**
 * Created by supostat on 01.04.16.
 */

app.controller('AdminVideoController', ['$scope', '$http', 'ENDPOINT_URI', 'ngDialog', 'Upload', '$sce', '$timeout', '$q',
    function ($scope, $http, ENDPOINT_URI, ngDialog, Upload, $sce, $timeout, $q) {
        var uploadedCount = 0;
        var filesCount = 0;



        function getVideos() {
            $http.get(ENDPOINT_URI + 'videos').then(function (response) {
                $scope.freeVideos = [];
                $scope.payedVideos = [];
                $scope.videos = response.data;
                angular.forEach($scope.videos, function (item) {
                    item.HTMLiframe = $sce.trustAsHtml(item.iframe);
                    if (item.free == 1) {
                        $scope.freeVideos.push(item);
                    } else {
                        $scope.payedVideos.push(item);
                    }
                });
            });
        }

        function getTutorHelpVideo() {
            $http.get(ENDPOINT_URI + 'videos/getTutorHelpVideo').then(function (response) {
                $scope.tutorsVideos = response.data;

                angular.forEach($scope.tutorsVideos, function (item) {
                    item.video.HTMLiframe = $sce.trustAsHtml(item.video.iframe);
                });

            });
        }

        getTutorHelpVideo();

        function getSubjects() {
            $http.get(ENDPOINT_URI + 'subjects/getSubjectsList').then(function (response) {
                $scope.subjects = response.data;

                $scope.selectedSubject.value = $scope.subjects[0];
            });
        }

        function getTicket() {
            var deferred = $q.defer();

            $http.get(ENDPOINT_URI + 'videos/getTicket').then(function (response) {
                deferred.resolve(response.data);
            });

            return deferred.promise;
        }

        getVideos();
        getSubjects();

        $scope.addVideo = function () {
            getTicket().then(function (ticket) {
                $scope.ticket = ticket;
                $scope.edited = false;
                $scope.newVideo = {};
                $scope.newVideo.free = 0;
                $scope.uploaded = false;
                ngDialog.open({
                    template: '/templates/admin/dialogs/video-upload.tpl.html',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByNavigation: false,
                    closeByDocument: false
                });
            });
        };

        $scope.addMultiplyVideo = function () {
            $scope.edited = false;
            $scope.newMultiplyVideos = [];
            $scope.newVideo = {};
            $scope.newVideo.free = 0;
            $scope.newVideo.active = 1;
            $scope.uploaded = false;
            ngDialog.open({
                template: '/templates/admin/dialogs/video-multiply-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.addTutorHelpVideo = function () {
            $scope.edited = false;
            $scope.uploaded = false;
            $scope.newVideo = {};
            getTicket().then(function (resp) {
                $scope.ticket = resp;
            });
            ngDialog.open({
                template: '/templates/admin/dialogs/tutor-help-video-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.sortPayedConfig = {
            animation: 150,
            group: {
                name: 'payed',
                put: ['free']
            },
            delay: 0,
            ghostClass: 'sortable-ghost',
            chosenClass: "sortable-chosen",
            forceFallback: false,
            onAdd: function (/**Event*/evt) {
                evt.model.free = 0;
                saveVideoState(evt.model);
            },
            onSort: function (/**Event*/evt) {
                saveOrder('payed', $scope.payedVideos)
            }
        };

        $scope.sortFreeConfig = {
            animation: 150,
            group: {
                name: 'free',
                put: ['payed']
            },
            delay: 0,
            ghostClass: 'sortable-ghost',
            chosenClass: "sortable-chosen",
            forceFallback: false,
            onAdd: function (/**Event*/evt) {
                evt.model.free = 1;
                saveVideoState(evt.model);
            },
            onSort: function (/**Event*/evt) {
                saveOrder('free', $scope.freeVideos)
            }
        };

        $scope.sortTutorConfig = {
            animation: 150,
            delay: 0,
            ghostClass: 'sortable-ghost',
            chosenClass: "sortable-chosen",
            forceFallback: false,
            onAdd: function (/**Event*/evt) {
                evt.model.free = 1;
                saveVideoState(evt.model);
            },
            onSort: function (/**Event*/evt) {
                saveOrder('tutor', $scope.tutorsVideos)
            }
        };

        function saveOrder(type, model) {
            var data = {
                type: type,
                videos: []
            };

            angular.forEach(model, function (value, key) {
                data.videos.push({id: value.id, order: key});
            });

            $http.put(ENDPOINT_URI + 'videos/saveOrder', data);
        }

        function saveVideoState(video) {
            $http.put(ENDPOINT_URI + 'videos/saveState', video).then(function (response) {
                console.log(true);
            });
        }

        $scope.multiplyPromises = [];

        function uploadUsingUpload(file, video, index, ticket) {
            $scope.multiplyPromises[index] = Upload.http({
                url: ticket.upload_link_secure,
                headers: {
                    'Content-Type': file.type
                },
                method: 'PUT',
                data: file
            }).then(function (response) {
                var data = {
                    complete_uri: ticket.complete_uri,
                    title: video.title,
                    description: video.description,
                    subject_id: $scope.selectedSubject.value.id,
                    free: $scope.newVideo.free,
                    active: $scope.newVideo.active
                };

                $http.post(ENDPOINT_URI + 'videos/applyVideo', data);

            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        }

        $scope.upload = function (file, video) {
            $scope.loader = Upload.http({
                url: $scope.ticket.upload_link_secure,
                headers: {
                    'Content-Type': file.type
                },
                method: 'PUT',
                data: file
            }).then(function (resp) {
                var data = {
                    complete_uri: $scope.ticket.complete_uri,
                    title: video.title,
                    description: video.description,
                    subject_id: $scope.selectedSubject.value.id,
                    free: video.free
                };

                return $http.post(ENDPOINT_URI + 'videos/applyVideo', data).then(function (response) {
                    $scope.uploaded = true;
                    getVideos();
                });
            }, function (resp) {
                console.log('Error status: ' + resp);
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        $scope.newVideoFiles = [];

        $scope.uploadMultiply = function (files, videos) {
            filesCount = files.length;
            var prom = [];
            if(files.length) {
                angular.forEach(files, function (item, i) {
                    prom.push(getTicket());
                });
                $q.all(prom).then(function (data) {
                    for (var i = 0; i < files.length; i++) {
                        $scope.errorMsg = null;
                        var ticket = data[i];
                        (function (f, video, index, ticket) {
                            uploadUsingUpload(f, video, index, ticket);
                        })(files[i], videos[i], i, ticket);
                    }
                    $scope.loader = $q.all($scope.multiplyPromises).then(function () {
                        $scope.uploaded = true;
                        getVideos();
                    });
                });
            //
            } else {
                // goBackAndNotice();
            }
        };

        $scope.uploadTutorVideo = function (file, tutorVideo) {


            $scope.loader = Upload.http({
                url: $scope.ticket.upload_link_secure,
                headers: {
                    'Content-Type': file.type
                },
                method: 'PUT',
                data: file
            }).then(function (resp) {
                var data = {
                    complete_uri: $scope.ticket.complete_uri,
                    title: tutorVideo.title,
                    description: tutorVideo.description,
                    active: tutorVideo.active
                };

                return $http.post(ENDPOINT_URI + 'videos/applyTutorHelpVideo', data).then(function (response) {
                    $scope.uploaded = true;
                    getTutorHelpVideo();
                });
            }, function (resp) {
                console.log('Error status: ' + resp);
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        $scope.openEditVideoDialog = function (video) {
            $scope.newVideo = angular.copy(video);
            $scope.newVideo.subject = {};
            angular.forEach($scope.subjects, function (item) {
                if (item.id == $scope.newVideo.subject_id) {
                    $scope.selectedSubject.value = item;
                }
            });
            $scope.uploaded = false;
            $scope.edited = true;
            ngDialog.open({
                template: '/templates/admin/dialogs/video-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.openEditTutorVideoDialog = function (video) {
            $scope.newVideo = angular.copy(video);

            $scope.uploaded = false;
            $scope.edited = true;
            ngDialog.open({
                template: '/templates/admin/dialogs/tutor-help-video-upload.tpl.html',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByNavigation: false,
                closeByDocument: false
            });
        };

        $scope.updateVideo = function (video, dialog) {
            video.subject_id = $scope.selectedSubject.value.id;
            $http.put(ENDPOINT_URI + 'videos/' + video.id, video).then(function (response) {
                getVideos();
            });
            dialog.closeThisDialog(0);
        };

        $scope.updateTutorVideo = function (tutorVideo, dialog) {
            $http.put(ENDPOINT_URI + 'videos/updateTutorVideo/' + tutorVideo.id, tutorVideo).then(function (response) {
                getTutorHelpVideo();
            });
            dialog.closeThisDialog(0);
        };

        $scope.filterVideo = function (subject) {
            if (subject) {
                $scope.freeVideos = [];
                $scope.payedVideos = [];
                angular.forEach($scope.videos, function (item) {
                    if (item.subject_id == subject.id) {
                        if (item.free == 1) {
                            $scope.freeVideos.push(item);
                        } else {
                            $scope.payedVideos.push(item);
                        }
                    }
                });
            } else {
                getVideos();
            }
        };
        $scope.openDeleteVideoDialog = function (video) {
            $scope.deletedVideo = video;
            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/delete-video.tpl.html',
                scope: $scope
            }).then(function (video) {
                $http.delete(ENDPOINT_URI + 'videos/' + video.id).then(function () {
                    getVideos();
                });
            });
        };

        $scope.openDeleteTutorVideoDialog = function (tutorVideo) {
            $scope.deletedVideo = tutorVideo.video;
            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/delete-video.tpl.html',
                scope: $scope
            }).then(function (video) {
                $http.delete(ENDPOINT_URI + 'videos/deleteTutorVideo/' + video.id).then(function () {
                    getTutorHelpVideo();
                });
            });
        };

        $scope.getVideoSubject = function (video) {
            var subject;
            angular.forEach($scope.subjects, function (item) {
                if (video.subject_id == item.id) {
                    subject = item.name;
                }
            });
            return subject;
        };

        $scope.showVideo = function (video) {
            $scope.showingVideo = video;
            ngDialog.openConfirm({
                template: '/templates/tutor/dialogs/view-video.tpl.html',
                scope: $scope,
                className: 'ngdialog-theme-default showing-video'
            }).then(function () {

            });
        };
        $scope.tutorsVideos = [];
        $scope.edited = false;
        $scope.selectedSubject = {};
        $scope.video_actions = false;
        $scope.payedVideos = [];
        $scope.freeVideos = [];
        $scope.newVideo = {};
        $scope.videos = [];
        $scope.videoFilter = {};
        $scope.ticket = {};
        $scope.deletedVideo = {};
        $scope.showingVideo = {};
    }
]);
/**
 * Created by igorpugachev on 10.05.16.
 */

app.controller('AdminsController', ['$scope', '$http', 'Notification', 'ENDPOINT_URI', 'ngDialog',
    function ($scope, $http, Notification, ENDPOINT_URI, ngDialog) {
        function getAdmins() {
            $http.get(ENDPOINT_URI + 'users/getAdmins').then(function (response) {
                $scope.admins = response.data;
            });
        }

        $scope.openAddAdminDialog = function () {
            ngDialog.open({
                template: '/templates/admin/dialogs/admin-new.tpl.html',
                scope: $scope
            });
        };

        $scope.addAdmin = function (admin, closeCallback) {
            $http.post(ENDPOINT_URI + 'users/createAdmin', admin).then(function (response) {
                getAdmins();
                closeCallback(0);
            });
        };

        $scope.deleteAdmin = function (admin, index) {
            $http.delete(ENDPOINT_URI + 'users/deleteAdmin/' + admin.id).then(function (response) {
                $scope.admins.splice(index, 1);
            });
        };

        getAdmins();

        $scope.admins = [];
    }]);
/**
 * Created by igorpugachev on 15.04.16.
 */


app.controller('CmsController', ['$scope', '$state', '$http', 'ENDPOINT_URI',
    function ($scope, $state, $http, ENDPOINT_URI) {

        function getPages() {
            $http.get(ENDPOINT_URI + 'cms/getPages').then(function (response) {
                $scope.pages = response.data;
            });
        }

        getPages();

        $scope.go = function (route, params, page) {
            $scope.page_name = page.title;
            $state.go(route, params);
        };

        $scope.pages = [];
    }
]);
/**
 * Created by igorpugachev on 15.04.16.
 */


app.controller('CmsEditController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams', 'Notification',
    function ($scope, $http, ENDPOINT_URI, $stateParams, Notification) {

        var page_id = $stateParams.page_id;

        function getContent() {
            $http.get(ENDPOINT_URI + 'cms/getContent/' + page_id).then(function (response) {
                if(response.data.length) {
                    console.log($scope.blocks);
                    $scope.blocks = response.data;
                }

                console.log($scope.blocks);
            });

        }

        getContent();

        $scope.tinymceOptions = {
            //setup: function (ed) {
            //    ed.on('init', function (args) {
            //        $('.mce-edit-area').writemaths({iFrame: true});
            //    });
            //},
            resize: false,
            height: 300,
            plugins: "",
            toolbar: "",
            valid_elements: "strong,ul,li,ol,em,br,p"
        };

        $scope.blocks = [
            {
                name: 'leftBlock1',
                page_id: page_id
            },
            {
                name: 'leftBlock2',
                page_id: page_id
            },
            {
                name: 'rightBlock1',
                page_id: page_id
            },
            {
                name: 'rightBlock2',
                page_id: page_id
            }
        ];

        $scope.save = function () {
            var data = {
                blocks: $scope.blocks
            };

            $http.post(ENDPOINT_URI + 'cms/saveContent', data).then(function (response) {
                Notification.success({
                    message: 'Successfully saved',
                    title: 'Cms'
                });
            });

        };
    }
]);
app.controller('UserProfileController', ['$scope', 'UsersService', 'Notification', 'ngDialog',
    function ($scope, UsersService, Notification, ngDialog) {

    UsersService.getRolesTypes().then(function (result) {
        $scope.rolesTypes = result.data;
        $scope.roleType.selected = result.data[0];
        UsersService.getUsers().then(function (result) {
            $scope.users = result.data;
        });
    });

    var selectRole = function () {
        var role = $scope.roleType.selected;
        UsersService.getUsers(role).then(function (result) {
            $scope.users = result.data;
        });
    };

    var deleteUser = function (index) {
        $scope.deletedUser = $scope.users[index];
        ngDialog.openConfirm({
            template: 'deleteUserTemplate',
            scope: $scope,
            showClose: false
        }).then(function () {
            UsersService.deleteUser($scope.users[index]).then(function (result) {
                Notification.success({
                    message: $scope.users[index].first_name + ' ' + $scope.users[index].last_name + ' has been deleted',
                    title: 'User deleting'
                });
                $scope.users.splice(index, 1);
            });
        });
    };

    $scope.users = [];
    $scope.rolesTypes = [];
    $scope.roleType = {};

    $scope.deletedUser = {};
    $scope.deleteUser = deleteUser;
    $scope.selectRole = selectRole;
}]);
var __slice = [].slice;
window.EquationEditor = {}, EquationEditor.Events = {
    on: function (t, n, o) {
        var e;
        return this._events || (this._events = {}), (e = this._events)[t] || (e[t] = []), this._events[t].push({
            callback: n,
            context: o || this
        })
    }, trigger: function (t) {
        var n, o;
        if (this._events)return n = Array.prototype.slice.call(arguments, 1), (o = this._events[t]) ? this.triggerEvents(o, n) : void 0
    }, triggerEvents: function (t, n) {
        var o, e, i, r, u;
        for (u = [], e = 0, i = t.length; i > e; e++)o = t[e], u.push((r = o.callback).call.apply(r, [o.context].concat(__slice.call(n))));
        return u
    }
}, EquationEditor.View = function () {
    function t(t) {
        this.options = t, this.$el = this.options.$el || $(this.options.el), this.initialize.apply(this, arguments)
    }

    return t.prototype.$ = function (t) {
        return this.$el.find(t)
    }, t.prototype.initialize = function () {
    }, t.prototype.createElement = function () {
        return this.$el = $(this.template())
    }, t
}();
var __bind = function (t, n) {
    return function () {
        return t.apply(n, arguments)
    }
}, __hasProp = {}.hasOwnProperty, __extends = function (t, n) {
    function o() {
        this.constructor = t
    }

    for (var e in n)__hasProp.call(n, e) && (t[e] = n[e]);
    return o.prototype = n.prototype, t.prototype = new o, t.__super__ = n.prototype, t
};
EquationEditor.CollapsibleView = function (t) {
    function n() {
        return this.toggleCollapse = __bind(this.toggleCollapse, this), n.__super__.constructor.apply(this, arguments)
    }

    return __extends(n, t), n.prototype.initialize = function () {
        return this.$(".collapsible-box-toggle").on("click", this.toggleCollapse)
    }, n.prototype.toggleCollapse = function (t) {
        return t.preventDefault(), this.$(".box-content-collapsible").is(":visible") ? this.closeCollapsible() : this.openCollapsible()
    }, n.prototype.openCollapsible = function () {
        return this.$(".box-content-collapsible").slideDown(), this.toggleOpenClass()
    }, n.prototype.closeCollapsible = function () {
        return this.$(".box-content-collapsible").slideUp(), this.toggleOpenClass()
    }, n.prototype.toggleOpenClass = function () {
        return this.$(".collapsible-box-toggle").toggleClass("collapsible-box-toggle-open")
    }, n
}(EquationEditor.View);
var __bind = function (t, n) {
    return function () {
        return t.apply(n, arguments)
    }
}, __hasProp = {}.hasOwnProperty, __extends = function (t, n) {
    function o() {
        this.constructor = t
    }

    for (var e in n)__hasProp.call(n, e) && (t[e] = n[e]);
    return o.prototype = n.prototype, t.prototype = new o, t.__super__ = n.prototype, t
};
EquationEditor.Buttons = {}, EquationEditor.Buttons.BaseButtonView = function (t) {
    function n() {
        return this.handleClick = __bind(this.handleClick, this), n.__super__.constructor.apply(this, arguments)
    }

    return __extends(n, t), n.prototype.initialize = function () {
        return this.latex = this.options.latex, this.buttonText = this.options.buttonText || this.options.latex, this.className = ["math-button", this.options.className].join(" ").trim()
    }, n.prototype.handleClick = function (t) {
        return t.preventDefault(), EquationEditor.Events.trigger("latex:" + this.event, this.latex)
    }, n.prototype.render = function () {
        return this.createElement(), this.$("a").on("click", this.handleClick), this
    }, n.prototype.template = function () {
        return '<div class="' + this.className + '">\n  <a title="' + this.buttonText + '" href="#">' + this.buttonText + "</a>\n</div>"
    }, n
}(EquationEditor.View), EquationEditor.Buttons.CommandButtonView = function (t) {
    function n() {
        return n.__super__.constructor.apply(this, arguments)
    }

    return __extends(n, t), n.prototype.event = "command", n
}(EquationEditor.Buttons.BaseButtonView), EquationEditor.Buttons.WriteButtonView = function (t) {
    function n() {
        return n.__super__.constructor.apply(this, arguments)
    }

    return __extends(n, t), n.prototype.event = "write", n
}(EquationEditor.Buttons.BaseButtonView);
var __bind = function (t, n) {
    return function () {
        return t.apply(n, arguments)
    }
}, __hasProp = {}.hasOwnProperty, __extends = function (t, n) {
    function o() {
        this.constructor = t
    }

    for (var e in n)__hasProp.call(n, e) && (t[e] = n[e]);
    return o.prototype = n.prototype, t.prototype = new o, t.__super__ = n.prototype, t
};
EquationEditor.ButtonGroupView = function (t) {
    function n() {
        return this.toggle = __bind(this.toggle, this), n.__super__.constructor.apply(this, arguments)
    }

    return __extends(n, t), n.prototype.initialize = function () {
        return this.groupName = this.options.groupName, this.buttonViews = this.options.buttonViews
    }, n.prototype.render = function () {
        return this.createElement(), this.renderButtons(), new EquationEditor.CollapsibleView({$el: this.$el}), this.$("header").click(this.toggle), this
    }, n.prototype.toggle = function () {
        return this.$(".collapsible-box-toggle").click()
    }, n.prototype.renderButtons = function () {
        var t, n, o, e, i;
        for (e = this.buttonViews, i = [], n = 0, o = e.length; o > n; n++)t = e[n], i.push(this.$(".buttons").append(t.render().$el));
        return i
    }, n.prototype.template = function () {
        return "<div class=\"button-group collapsible\">\n  <a href='#' class='collapsible-box-toggle ss-dropdown'></a> <header>" + this.groupName + '</header>\n\n  <div class="buttons box-content-collapsible hidden"></div>\n</div>'
    }, n
}(EquationEditor.View), EquationEditor.ButtonViewFactory = {
    create: function (config) {
        var buttonConfig, buttons, klass, _i, _len;
        for (buttons = [], _i = 0, _len = config.length; _len > _i; _i++)buttonConfig = config[_i], klass = eval(buttonConfig.klass), buttons.push(new klass(buttonConfig));
        return buttons
    }
}, EquationEditor.ButtonGroupViewFactory = {
    create: function (t) {
        var n, o, e, i;
        for (o = [], e = 0, i = t.length; i > e; e++)n = t[e], n.buttonViews = EquationEditor.ButtonViewFactory.create(n.buttonViews), o.push(new EquationEditor.ButtonGroupView(n));
        return o
    }
};
var ButtonGroup, Buttons, __bind = function (t, n) {
    return function () {
        return t.apply(n, arguments)
    }
}, __hasProp = {}.hasOwnProperty, __extends = function (t, n) {
    function o() {
        this.constructor = t
    }

    for (var e in n)__hasProp.call(n, e) && (t[e] = n[e]);
    return o.prototype = n.prototype, t.prototype = new o, t.__super__ = n.prototype, t
};
Buttons = EquationEditor.Buttons, ButtonGroup = EquationEditor.ButtonGroupView, EquationEditor.EquationEditorView = function (t) {
    function n() {
        return this.focus = __bind(this.focus, this), this.handleWriteButton = __bind(this.handleWriteButton, this), this.handleCommandButton = __bind(this.handleCommandButton, this), n.__super__.constructor.apply(this, arguments)
    }

    return __extends(n, t), n.prototype.initialize = function () {
        return this.existingLatex = this.options.existingLatex, this.restrictions = this.options.restrictions || {}, EquationEditor.Events.on("latex:command", this.handleCommandButton, this), EquationEditor.Events.on("latex:write", this.handleWriteButton, this)
    }, n.prototype.render = function () {
        return $.getJSON("config.json").done(function (t) {
            return function (n) {
                return t.config = n, t.addButtonBar(), t.addButtonGroups(), t.enableMathMagic()
            }
        }(this)), this
    }, n.prototype.enableMathMagic = function () {
        return this.$(".math-button a").mathquill(), this.input().mathquill("editable"), null != this.existingLatex && this.input().mathquill("latex", this.existingLatex), this.focus()
    }, n.prototype.input = function () {
        return this.$(".math")
    }, n.prototype.addButtonBar = function () {
        var t, n, o, e, i;
        for (e = this.buttonBarButtons(), i = [], n = 0, o = e.length; o > n; n++)t = e[n], i.push(this.$(".button-bar").append(t.render().$el));
        return i
    }, n.prototype.addButtonGroups = function () {
        var t, n, o, e, i;
        for (e = this.buttonGroups(), i = [], n = 0, o = e.length; o > n; n++)t = e[n], i.push(this.$(".button-groups").append(t.render().$el));
        return i
    }, n.prototype.buttonBarButtons = function () {
        return EquationEditor.ButtonViewFactory.create(this.config.buttonBar)
    }, n.prototype.buttonGroups = function () {
        var t;
        return t = this.basicButtonGroups(), this.restrictions.disallow_intermediate || (t = t.concat(this.intermediateButtonGroups())), this.restrictions.disallow_advanced || (t = t.concat(this.advancedButtonGroups())), t
    }, n.prototype.basicButtonGroups = function () {
        return EquationEditor.ButtonGroupViewFactory.create(this.config.buttonGroups.basic)
    }, n.prototype.intermediateButtonGroups = function () {
        return EquationEditor.ButtonGroupViewFactory.create(this.config.buttonGroups.intermediate)
    }, n.prototype.advancedButtonGroups = function () {
        return EquationEditor.ButtonGroupViewFactory.create(this.config.buttonGroups.advanced)
    }, n.prototype.handleCommandButton = function (t) {
        return this.performCommand(t), this.focus()
    }, n.prototype.handleWriteButton = function (t) {
        return this.performWrite(t), this.focus()
    }, n.prototype.performCommand = function (t) {
        return this.input().mathquill("cmd", t)
    }, n.prototype.performWrite = function (t) {
        return this.input().mathquill("write", t)
    }, n.prototype.focus = function () {
        return this.$("textarea").focus()
    }, n.prototype.equationLatex = function () {
        return this.input().mathquill("latex")
    }, n
}(EquationEditor.View);
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
tinymce.create("tinymce.plugins.EquationEditorPlugin", {
    init: function (t, e) {
        var n;
        return n = null, t.addCommand("mceMathquill", function (i) {
            var r;
            return i || (i = ""), r = t.windowManager.open({
                url: "/js/tinymce-dist/plugins/equation/equation_editor.html",
                width: 820,
                height: 400,
                inline: 1,
                popup_css: !1,
                title: "Equation Editor",
                buttons: [{
                    text: "insert", subtype: "primary", onclick: function () {
                        var e, n;
                        return n = t.windowManager.getWindows()[0], e = t.windowManager.getParams().latexInput.mathquill("latex"), t.execCommand("mceMathquillInsert", e), n.close()
                    }
                }, {
                    text: "cancel", onclick: function () {
                        return n = null, t.windowManager.getWindows()[0].close()
                    }
                }]
            }, {plugin_url: e, existing_latex: i})
        }), t.addCommand("mceMathquillInsert", function (e) {
            var i;
            //if (e)return i = '&nbsp;<span class="rendered-latex" contenteditable="false">\n  ' + e + "\n</span>&nbsp;", n && t.selection.select(n), n = null, t.selection.setContent(i)
            if (e)return i = '$$' + e + "$$", n && t.selection.select(n), n = null, t.selection.setContent(i)
        }), t.on("init", function () {
            return $(t.getDoc()).on("click", ".rendered-latex", function (e) {
                var i;
                return e.stopPropagation(), n = this, i = $(this).find(".selectable").text().replace(/^\$/, "").replace(/\$$/, ""), t.execCommand("mceMathquill", i)
            })
        }), t.addButton("equationeditor", {
            title: "Equation editor",
            cmd: "mceMathquill",
            text: "f(x)"
        }), t.on("preProcess", function (t) {
            var e;
            return e = t.target.dom.select(".rendered-latex:not(.mathquill-rendered-math)")
        }), t.on("loadContent", function (t) {
            var e;
            return e = t.target.dom.select("span.rendered-latex:not(.mathquill-rendered-math)")
        }), t.on("setContent", function (t) {
            var e;
            //return e = t.target.dom.select("span.rendered-latex:not(.mathquill-rendered-math)"), $(e).mathquill()
            e = t.target.dom.select("span.rendered-latex:not(.mathquill-rendered-math)");
            return $(e).html();
        })
    }, getInfo: function () {
        return {
            longname: "Equation Editor",
            author: "Foraker, derived from https://github.com/laughinghan/tinymce_mathquill_plugin",
            authorurl: "http://www.foraker.com",
            infourl: "https://github.com/foraker/tinymce_equation_editor",
            version: "1.0"
        }
    }
}), tinymce.PluginManager.add("equationeditor", tinymce.plugins.EquationEditorPlugin);
app.controller('StudentViewProfileController', ['$scope', '$stateParams', 'StudentsModel',
    function ($scope, $stateParams, StudentsModel) {
        function getAvatarSrc(student) {
            if(student.avatar) return student.avatar.thumb;
            if(student.sex == 1) return '/images/nophoto-male.jpg';
            if(student.sex == 0) return '/images/nophoto-female.jpg';
        }


        function getStudentData() {
            console.log($stateParams);
            StudentsModel.getStudent($stateParams.id).then(function (result) {
                console.log(result.data);
                $scope.student = result.data;
            })
        }

        $scope.student = {};
        $scope.getAvatarSrc = getAvatarSrc;

        getStudentData();
    }]);
app.controller('StudentListController', ['$scope', '$state', 'StudentsModel', '$log',
    function ($scope, $state, StudentsModel, $log) {
        $scope.view = '/templates/views/students-list.html';

        $scope.views = [{
            name: 'List',
            template: '/templates/views/students-list.html',
            icon: 'btn btn-default navbar-btn fa fa-list'
        }, {
            name: 'Grid',
            template: '/templates/views/students-grid.html',
            icon: 'btn btn-default navbar-btn fa fa-th'
        }];

        function getAvatarSrc(student) {
            if(student.avatar) return student.avatar.thumb;
            if(student.sex == 1) return '/images/nophoto-male.jpg';
            if(student.sex == 0) return '/images/nophoto-female.jpg';
        }

        function getStudentsList() {
            StudentsModel.getStudentsList().then(function (result) {
                $scope.students = result.data;
                $scope.maxSize = $scope.students.length;
                $scope.filteredStudents = $scope.students.slice(0, 5);
            })
        }

        $scope.viewProfile = function (student) {
            return 'usersProfiles.students.student({id: student.id})';
        };

        $scope.numPerPage = 5;
        $scope.currentPage = 1;

        $scope.pageChanged = function (currentPage) {
            var begin = ((currentPage - 1) * $scope.numPerPage);
            var end = begin + $scope.numPerPage;
            $scope.filteredStudents = $scope.students.slice(begin, end);
        };

        $scope.students = [];
        $scope.getAvatarSrc = getAvatarSrc;
        getStudentsList();
    }]);
/**
 * Created by supostat on 23.03.16.
 */

app.controller('TutorViewProfileController', ['$scope', 'ENDPOINT_URI', '$http', 'Notification', '$sce',
    function ($scope, ENDPOINT_URI, $http, Notification, $sce) {
        function getTutor(id) {
            $http.get(ENDPOINT_URI + 'tutors/' + id).then(
                function (response) {
                    $scope.tutor = response.data;
                    $scope.tutor.iframe = $sce.trustAsHtml($scope.tutor.iframe);
                    console.log($scope.tutor);
                },
                function (response) {
                }
            );
        }

        $scope.getYoutubeId = function (url) {
            if(url) {
                var regexp = '(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})';
                var match = url.match(regexp);
                if(match) {
                    return 'https://www.youtube.com/embed/' + match[1];
                }
                return false;
            }
        };

        $scope.sendRequest = function (tutor) {
            $http.post(ENDPOINT_URI + 'student/send-request', tutor).then(
                function () {
                    Notification.success({
                        message: 'Successfully send',
                        title: 'Request'
                    });
                    tutor.requested = true;
                },
                function (response) {
                    Notification.error({
                        message: response.data
                    });
                }
            );
        };

        $scope.getTutor = getTutor;

        $scope.tutor = {};
    }]);

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
        path = 'examtypes';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.allfree = function () {
        return $http.get('/v1/examtypes/allfree');
    };

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

    service.checkFree = function (itemId) {
        return $http.post(getUrl() + '/checkfree/' + itemId);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };

    service.saveOrder = function (data) {
        return $http.post(getUrl() + '/saveOrder', data);
    };


    service.changeState = function (item) {
        item.active = !item.active;
        return $http.put(getUrl() + '/changeState/' + item.id, item);
    };
}]);
/**
 * Created by supostat on 09.11.15.
 */

app.service('PracticeExamsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'quizpractices';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.selectAnswer = function (answer) {
        return $http.post(getUrl() + '/selectanswer', answer);
    };

    service.essayChange = function (question) {
        return $http.post(getUrl() + '/essaychange', question);
    };

    service.all = function (subject_id) {
        return $http.get(getUrl() + '/all?id=' + subject_id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.getQuestions = function (itemId) {
        return $http.get(getUrl() + '/viewall/' + itemId);
    };

    service.getFinishedQuizzes = function () {
        return $http.get(getUrl() + '/getFinishedQuizzes');
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

    service.allQuizzes = function () {
        return $http.get(getUrl() + '/list');
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

    service.saveOrder = function (data) {
        return $http.post(getUrl() + '/saveOrder', data);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
}]);
/**
 * Created by supostat on 05.11.15.
 */
app.service('SectionsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'sections';

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
app.service('StudentsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var url = ENDPOINT_URI + 'students';

    var service = this;

    service.getStudentsList = function () {
        return $http.get(url);
    };

    service.getStudent = function (id) {
        return $http.get(url + '/' + id);
    }
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

    service.getTutorSubjectList = function (exam_id) {
        return $http.get(getUrl() + '/getTutorSubjectList/' + exam_id);
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };
    service.add = function (item) {
        return $http.post(getUrl() + '/add', item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.saveOrder = function (data) {
        return $http.post(getUrl() + '/saveOrder', data);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
    service.remove = function (itemId) {
        return $http.post(getUrl() + '/remove/' + itemId);
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

app.service('TutorsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var url = ENDPOINT_URI + 'tutors';

    var service = this;

    service.getStudentsList = function () {
        return $http.get(url + '/students');
    };

    service.getStudentsRequests = function () {
        return $http.get(url + '/studentsRequests');
    };

    service.acceptRequest = function (data) {
        return $http.post(url + '/acceptRequest', data);
    };

    service.rejectRequest = function (data) {
        return $http.post(url + '/rejectRequest', data);
    };
}]);
app.service('UsersListModel', ['$http', 'ENDPOINT_URI',
    function ($http, ENDPOINT_URI) {
        var url = ENDPOINT_URI + 'users',
            service = this;

        service.getUsersList = function () {
            return $http.get(url);
        };

    }]);


/**
 * Created by supostat on 28.12.15.
 */
app.service('UsersModel', ['$http', 'ENDPOINT_URI', 'Upload', function ($http, ENDPOINT_URI, Upload) {
    var user = {};
    var url = ENDPOINT_URI + 'users';

    var service = this;

    service.getCurrentUser = function () {
        return $http.get(url + '/get-user-data');
    };

    service.saveProfile = function (data) {
        return Upload.upload({
            url: url + '/profile/' + data.id,
            data: data
        });
    };

    service.getNamesByType = function (type, data) {
        return $http.post(url + '/getNamesByType/' + type, data);
    };

    service.sendRequest = function (data) {
        return $http.post(url + '/sendRequest', data);
    };

    service.getRequests = function (data) {
        return $http.get(url + '/getRequests', {params: data});
    };

    service.getTutorStudentsCount = function () {
        return $http.get(url + '/getStudentsCount');
    };

    service.getRequestsCount = function () {
        return $http.get(url + '/getRequestsCount');
    };

    service.searchUsers = function (data) {
        return $http.post(url + '/searchUsers', data);
    };
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
 * Created by supostat on 14.12.15.
 */


app.service("User", ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this;

    service.isAdmin = function () {
        return $http.get(ENDPOINT_URI + 'users/getpermission');
    };
}]);
/**
 * Created by supostat on 15.12.15.
 */


app.service('UsersService', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var user = {};
    var url = ENDPOINT_URI + 'users';
    user.role = 'admin';
    return {
        getUser: function () {
            return user;
        },
        generateRoleData: function () {
            $http.get(url + '/getpermission').then(function (result) {
                user.role = result.data ? result.data : 'guest';
                return user;
            });
        },
        getUsers: function (usertype) {
            console.log(usertype);
            var link = usertype?'/' + usertype.id:'';
            return $http.get(url + '/get-users' + link);
        },
        deleteUser: function (user) {
            return $http.delete(url + '/' + user.id);
        },
        getRolesTypes: function () {
            return $http.get(url + '/get-roles');
        }
    };

}]);
//# sourceMappingURL=angular_admin.js.map
