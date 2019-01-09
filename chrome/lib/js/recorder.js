/* jshint esversion:6 */
/* jshint strict: false */


/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

class Recorder {

    constructor(window) {
        this.window = window;
        this.attached = false;
        this.frameLocation = this.getFrameLocation();
        /*
        browser.runtime.sendMessage({
            frameLocation: this.frameLocation
        }).catch(function(reason) {
            // Failed silently if receiving end does not exist
        });
        */
    }

    // This part of code is copyright by Software Freedom Conservancy(SFC)
    parseEventKey(eventKey) {
        if (eventKey.match(/^C_/)) {
            return { eventName: eventKey.substring(2), capture: true };
        } else {
            return { eventName: eventKey, capture: false };
        }
    }

    // This part of code is copyright by Software Freedom Conservancy(SFC)
    attach(events, eventId, eventType) {
        if (this.attached) {
            return;
        }
        this.attached = true;
        this.eventListeners = {};
        this.eventType = eventType;
        this.eventId = eventId;
        var self = this;

        for (let eventKey in Recorder.eventHandlers) {
            var eventInfo = this.parseEventKey(eventKey);
            var eventName = eventInfo.eventName;
            var capture = eventInfo.capture;

            if (events.indexOf(eventName) < 0) {
                return;
            }

            // create new function so that the variables have new scope.
            function register() {
                var handlers = Recorder.eventHandlers[eventKey];
                var listener = function(event) {
                    for (var i = 0; i < handlers.length; i++) {
                        handlers[i].call(self, event);
                    }
                }
                this.window.document.addEventListener(eventName, listener, capture);
                this.eventListeners[eventKey] = listener;
            }
            register.call(this);
        }
    }

    // This part of code is copyright by Software Freedom Conservancy(SFC)
    detach() {
        if (!this.attached) {
            return;
        }
        this.attached = false;
        for (let eventKey in this.eventListeners) {
            var eventInfo = this.parseEventKey(eventKey);
            var eventName = eventInfo.eventName;
            var capture = eventInfo.capture;
            this.window.document.removeEventListener(eventName, this.eventListeners[eventKey], capture);
        }
        delete this.eventListeners;
        $(".highlighter").remove();
    }

    showMouseOverBox(event) {
        let overlay = $(".highlighter");
        if (event.target === document.body) {
            overlay.hide();
            return;
        }
        if (event.target) {
            let tgt = $(event.target);

            let offset = tgt.offset();
            let width = tgt.outerWidth();
            let height = tgt.outerHeight();

            overlay.css({
                top: offset.top,
                left: offset.left,
                width: width,
                height: height
            }).show();
        }
    }

    getFrameLocation() {
        let currentWindow = window;
        let currentParentWindow;
        let frameLocation = "";
        while (currentWindow !== window.top) {
            currentParentWindow = currentWindow.parent;
            for (let idx = 0; idx < currentParentWindow.frames.length; idx++)
                if (currentParentWindow.frames[idx] === currentWindow) {
                    frameLocation = ":" + idx + frameLocation;
                    currentWindow = currentParentWindow;
                    break;
                }
        }
        return frameLocation = "root" + frameLocation;
    }

    readFromStorage(event) {
        return new Promise( (resolve, reject) => {
            chrome.storage.local.get(null, function(items) {
                resolve([items, event]); 
            });
        });
    }

    getElementByXPath(path) {
        for (let p of path) {
            if (document.evaluate(p, document, null, XPathResult. FIRST_ORDERED_NODE_TYPE, null).singleNodeValue !== null) {
                return true;
            }
        }
        return false;
    }

    getXPath(node) {
        if (node.id && node.id !== "") {
            return ['id("' + node.id + '")'];
        }
        if (node == document.body) {
            return [node.tagName];
        }

        var ix = 0;
        try {
            var siblings = node.parentNode.childNodes;
        }
        catch (error) {
            return null;
        }
        let xp = [];
        for (var i=0, sibling; sibling=siblings[i]; i++) {
            if (sibling === node) {
                if (node.tagName.toLowerCase() == "a") {
                    xp.push(this.getXPath(node.parentNode) + "/" + node.tagName + '[text()="' + node.text + '"]');
                }
                xp.push(this.getXPath(node.parentNode) + "/" + node.tagName + "[" + (ix + 1) + "]");
                return xp;
            }
            if (sibling.nodeType === 1 && sibling.tagName === node.tagName) {
                ix++;
            }
        }
    }

    getParentBlock(node, parentTag) {
        // for now only looks for closest enclosing parent table
        if (!parentTag || parentTag === "" || parentTag === undefined) {
            parentTag = "table";
        }
        var tgt_table_parent = $(node).parents(parentTag);
        return (tgt_table_parent.length > 0) ? tgt_table_parent[0] : node;
    }

    getCSSSelector(node) {
        if (!node.nodeName) {
            return;
        }
        var selector = node.nodeName.toLowerCase();
        if (node.id) {
            selector += '#' + node.id;
        } else if (node.classList.length > 0) {
            for (var i=0, cls; cls=node.classList[i]; i++) {
                selector += "." + cls.trim();
            }
        }
        return selector;
    }

    selectorReturnsUniqueElement(selector, path) {
        var ele = document.querySelectorAll(selector);
        if (!path) {
            return true;
        }
        var xele = this.getElementByXPath(path);
        if (ele.length == 1 || !xele) {
            return true;
        }
        else {
            return false;
        }
    }

    getElementSelectors(event) {

        var selectors = {};
        selectors.elementSelectors = [];

        var top = event.pageY,
        left = event.pageX;
        var element = event.target;
        do {
            top -= element.offsetTop;
            left -= element.offsetLeft;
            element = element.offsetParent;
        } while (element);

        selectors.position = left + "," + top;

        var target = event.target;
        if (this.eventType == "select_all_links") {
            target = this.getParentBlock(target);
        }
        var baseURI = target.baseURI;

        var paths = this.getXPath(target);

        var selCount = 0;

        var sel = this.getCSSSelector(target);
        if (this.eventType == "select_all_links") {
            sel += " a";
        }
        selectors.elementSelectors.push({
            "selector": sel,
            "selectorType": "CSSSelector",
            "selectorOrder": selCount++,
            "selectorPreferred": true
        });

        for (var i of paths) {
            if (this.eventType == "select_all_links") {
                i += "//a";
            }
            selectors.elementSelectors.push({
                "selector": i,
                "selectorType": "XPath",
                "selectorOrder": selCount++,
                "selectorPreferred": false
            });
        }

        selectors.eventId = this.eventId;
        return selectors;
    }

    record(event, event_type) {
        if (event_type != "click") {
            return;
        }
        //let self = this;
        var eve = {};
        /*
        DO NOT DELETE!!! Original Selenium JSON.
        eve[baseURI] = {
            command: command,
            target: target,
            value: value,
            insertBeforeLastCommand: insertBeforeLastCommand,
            frameLocation: (actualFrameLocation != undefined ) ? actualFrameLocation : this.frameLocation,
        };
        */
        /*
        this.readFromStorage(event)
        .then(this.getElementSelectors)
        .then(this.serializeToTracerJSON)
        .then( (events) => {
            chrome.storage.local.set(events);
        });
        */
        let selectors = this.getElementSelectors(event);

        let val = {};
        val["clickedSelector"] = {
            "chosenSelectors": selectors,
            "frameIndex": this.frameLocation,
            "detachRecorder": true
        };
        chrome.storage.local.set(val);
        /*
        chrome.runtime.sendMessage({
            "chosenSelectors": selectors,
            "frameIndex": this.frameLocation
        });

        chrome.runtime.sendMessage({detachRecorder: true});
        */
        //recorder.detach();
    }
}

Recorder.eventType = null;
Recorder.prev = null;

Recorder.eventHandlers = {};
Recorder.addEventHandler = function(handlerName, eventName, handler, options) {
    handler.handlerName = handlerName;
    if (!options) options = false;
    let key = options ? ('C_' + eventName) : eventName;
    if (!this.eventHandlers[key]) {
        this.eventHandlers[key] = [];
    }
    this.eventHandlers[key].push(handler);
}


// TODO: new by another object
var recorder = new Recorder(window);

// TODO: move to appropriate file
// show element
function startShowElement(message, sender, sendResponse){
    if (message.showElement) {
        result = selenium["doShowElement"](message.targetValue);
        return Promise.resolve({result: result});
    }
}
//browser.runtime.onMessage.addListener(startShowElement);