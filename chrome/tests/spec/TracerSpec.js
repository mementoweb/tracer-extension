/* jshint esversion:6 */
/* jshint strict: false */


describe ("Tracer Test Suite", function() {
	beforeEach( function() {
		
		this.trace = {
	"userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3431.0 Safari/537.36",
	"resourceURL": "https://www.slideshare.net/hvdsomp/paul-evan-peters-lecture",
	"traceName": "test",

	"actions": {
		"azxdfds22d": {
			"id": "azxdfds22d",
			"name": "Starting Resource",
			"uriPattern": "https://www.slideshare.net/[hvdsomp]/[paul-evan-peters-lecture]",
			"selectorId": [],
			"selectorType": [],
			"actionName": "load",
			"locationURL": "https://www.slideshare.net/hvdsomp/paul-evan-peters-lecture",
			"traceURL": null,
			"actionApply": "once",
			"repeat": 0,
			"parentId": "azxdfds22d",

			"children": {
				"bgsjlwp335n": {
					"id": "bgsjlwp335n",
					"parentId": "azxdfds22d",
					"name": "Next Slide",
					"uriPattern": null,
					"selectorId": ["div.j-next-btn.arrow-right"],
					"selectorType": ["CSSSelector"],
					"actionName": "click",
					"locationURL": "https://www.slideshare.net/hvdsomp/paul-evan-peters-lecture",
					"traceURL": null,
					"repeat": {
						"until": {
							"selectorType": ["locationURL"],
							"selectorCondition": "changes",
							"selectorId": []
						}
					}
				},
				"7654bfdgbnjk": {
					"id": "7654bfdgbnjk",
					"parentId": "azxdfds22d",
					"name": "Next Slide",
					"uriPattern": null,
					"selectorId": ["li.j-related-item a:first-of-type"],
					"selectorType": ["CSSSelector"],
					"actionName": "click",
					"locationURL": "https://www.slideshare.net/hvdsomp/perseverance-on-persistence",
					"traceURL": null,
					"repeat": {
						"until": {
							"selectorType": ["resourceCount"],
							"selectorCondition": "equals",
							"selectorId": ["5"]
						}
					},
					"children": {
						"hjs33fj0um": {
							"id": "hjs33fj0um",
							"parentId": "7654bfdgbnjk",
							"name": "Stats Tab",
							"uriPattern": null,
							"selectorId": ["a.j-stats-tab"],
							"selectorType": ["CSSSelector"],
							"actionName": "click",
							"locationURL": "https://www.slideshare.net/hvdsomp/perseverance-on-persistence",
							"traceURL": null,
							"repeat": 0
						}
					}
				},
			},
		}
	}
};
	});

	it("checking if the trace has the starting resource", function() {
		expect(Object.keys(this.trace.actions).length).toEqual(1);
	});

	it("checking if getTracerEvent works (using BFS)", function() {

		let testTrace = new Trace();
		let tracerEvent1 = testTrace.getTracerEvent("hjs33fj0um", actions=this.trace.actions);
		expect(tracerEvent1.id).toEqual("hjs33fj0um");

		let tracerEvent2 = testTrace.getTracerEvent("7654bfdgbnjk", actions=this.trace.actions);
		expect(tracerEvent2.id).toEqual("7654bfdgbnjk");
		
		let tracerEvent3 = testTrace.getTracerEvent("bgsjlwp335n", actions=this.trace.actions);
		expect(tracerEvent3.id).toEqual("bgsjlwp335n");
		
		let tracerEvent4 = testTrace.getTracerEvent("azxdfds22d", actions=this.trace.actions);
		expect(tracerEvent4.id).toEqual("azxdfds22d");

		let tracerEvent5 = testTrace.getTracerEvent("notthere", actions=this.trace.actions);
		expect(tracerEvent5).toBe(null);
		
	});

	it("adding new child events", function() {
		let testTrace = new Trace();
		let startingEvent = new TracerEvent(eventName="Starting Resource",
										actionName="load");
		var success = testTrace.addAction(startingEvent);
		expect(success).toBe(true);
		expect(testTrace.actions[startingEvent.id]).toEqual(startingEvent);

		let event1 = new TracerEvent(eventName="Event 1",
										actionName="click",
										resourceUrl=null,
										parentId=startingEvent.id);
		var success1 = testTrace.addAction(event1);
		expect(success1).toBe(true);

		let event2 = new TracerEvent(eventName="Event 2",
										actionName="click",
										resourceUrl=null,
										parentId=event1.id);
		var success2 = testTrace.addAction(event2);
		expect(success2).toBe(true);

		expect(testTrace.getTracerEvent(event2.id));

	});

	it("shortest path", function() {
		let testTrace = Trace.fromJSON(this.trace);
		let path = testTrace.getShortestPath("7654bfdgbnjk");
		expect(path).toBe("azxdfds22d.7654bfdgbnjk");
	});

	it("delete event", function() {
		let testTrace = Trace.fromJSON(this.trace);
		let path = testTrace.deleteEvent("7654bfdgbnjk");
		expect(path).toBe(true);
		console.log(testTrace);
	});

});