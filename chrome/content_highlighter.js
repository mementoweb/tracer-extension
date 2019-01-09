/* jshint esversion:6 */
/* jshint strict: false */


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
	if (msg.attachRecorder && msg.attachRecorder.length > 0) {
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
