
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
		g.style.width = width - 400 + "px";
		sidePane.style.width = "400px";
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
	sidePane.style.width = "425px";
	sidePane.style.position = "fixed";
	sidePane.style.top = "0px";
	sidePane.style.right = "0px";
	sidePane.style.zIndex = "100000";
	sidePane.frameBorder = "none";
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

//( function() {

	chrome.runtime.onMessage.addListener( function(msg, sender) {
		if (msg == "togglePopup") {
			toggleExtensionPane();
		}
		else if (msg.attachRecorder && msg.attachRecorder.length > 0) {
			recorder.attach(msg.attachRecorder[0], msg.attachRecorder[1], msg.attachRecorder[2]);
		}
		else if (msg.detachRecorder) {
			recorder.detach();
		}
		else if (msg.highlightElements) {

			let matchedElements = getElements(msg.highlightElements);
			for (let ele of matchedElements) {
            	ele.style["border"] = "3px solid black";
            	ele.style["z-index"] = "10000";
			}
		}
		else if (msg.removeElementHighlight) {
			let matchedElements = getElements(msg.removeElementHighlight);
			for (let ele of matchedElements) {
            	ele.style["border"] = "none";
            	ele.style["z-index"] = "none";
			}

		}
		/*
		else if (msg.chosenSelectors) {
			var eventId = msg.chosenSelectors.eventId;
			console.log(eventId);
			var modal = document.getElementById("#action_modal_" + eventId);
			console.log(modal);	
		}
		*/
	});

	createExtensionPage();

//})();

