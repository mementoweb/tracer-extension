
/* jshint esversion:6 */
/* jshint strict: false */


function toggleExtensionPane() {
	var sidePane = document.getElementById("boundarySidePane");
	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    width = w.innerWidth || e.clientWidth || g.clientWidth;
	if (sidePane.style.width == "0px") {
		g.style.width = width - 425 + "px";
		sidePane.style.width = "425px";
	}
	else {
		g.style.width = width + "px";
		sidePane.style.width = "0px";
	}
}

function createExtensionPage() {
	var sidePane = document.createElement("iframe");
	sidePane.id = "boundarySidePane";
	sidePane.style.height = "100%";
	sidePane.style.width = "0px";
	sidePane.style.position = "fixed";
	sidePane.style.top = "0px";
	sidePane.style.right = "0px";
	sidePane.style.zIndex = "100000";
	sidePane.frameBorder = "none";
	sidePane.scrolling = "no";
	sidePane.src = chrome.extension.getURL("popup.html");

	document.body.appendChild(sidePane);	
}

function getElements(selector) {

	let matchedElements = [];
	if (selector.selectorType == "CSSSelector") {
		matchedElements = document.querySelectorAll(selector.selector); 

	}
	else if (selector.selectorType == "XPath") {
		let res = document.evaluate(selector.selector,
			document, 
			null, 
			XPathResult.ANY_TYPE, 
			null);

		let ele = res.iterateNext();
		while (ele) {
			matchedElements.push(ele);
			ele = res.iterateNext();
		}
	}
	return matchedElements;
}

function createHighlighter(cls=null) {
	let highlighter = document.createElement("div");
	if (cls) {
		highlighter.setAttribute("class", cls);
	}
	else {
		highlighter.setAttribute("class", "highlighter");
	}
	highlighter.style.cssText = 'position: absolute; background-color: #17a2b8; opacity: 0.5; z-index:100000; pointer-events:none; display:none;';
	return highlighter;
}

function showHighlighterForElement(element) {
	let highlighter = createHighlighter("multi-highlighter");
	document.body.appendChild(highlighter);

	let tgt = $(element);
	let offset = tgt.offset();
	let width = tgt.outerWidth();
	let height = tgt.outerHeight();

	$(highlighter).css({
		top: offset.top,
		left: offset.left,
		width: width,
		height: height
	}).show();
}

function hideAllHighlighters() {
	$(".multi-highlighter").remove();

}

chrome.runtime.onMessage.addListener( function(msg, sender) {
	if (msg == "togglePopup") {
		toggleExtensionPane();
	}
	else if (msg.attachRecorder && msg.attachRecorder.length > 0) {
		let highlighter = createHighlighter();
		document.body.appendChild(highlighter);

		recorder.attach(msg.attachRecorder[0], msg.attachRecorder[1], msg.attachRecorder[2]);
	}
	else if (msg.detachRecorder) {
		recorder.detach();
	}
	else if (msg.highlightElements) {

		let matchedElements = getElements(msg.highlightElements);
		for (let ele of matchedElements) {
			showHighlighterForElement(ele);
		}
	}
	else if (msg.removeElementHighlight) {
		hideAllHighlighters();
	}
});

createExtensionPage();
