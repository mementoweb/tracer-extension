chrome.browserAction.onClicked.addListener( function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, "togglePopup");
	});
});

/*
chrome.webRequest.onHeadersReceived.addListener( function(details) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (details.tabId == tabs[0].id) {
			chrome.tabs.sendMessage(tabs[0].id, "reattachEvents");
		}
	});
}, {urls: ["<all_urls>"]}, ["responseHeaders"]);
*/

