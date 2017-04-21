suite("TempelateEngine", function() {
	var TempelateEngine = require("../tempelate_engine/tempelate_engine.js");
	var assume      = require('assume');

	suite("non nested propert access", function () {
		test("with propert access", async () => {
			let tempelate = { id: "{{ clientId }}" };
			let context = { clientId: "123"};
			let engine = new TempelateEngine(tempelate, context);
			engine.render();
			assume(engine.getTempelate()).deep.equals({id: "123"});
		});

		test("with index access", async () => {
			let tempelate = { id: "{{ 0 }}", name: "{{ 2 }}", count: "{{ 1 }}" };
			let context = ["123", 248, "doodle"];
			let engine = new TempelateEngine(tempelate, context);
			engine.render();
			assume(engine.getTempelate()).deep.equals({id: "123", name: "doodle", count: 248});	
		});
	});

	suite("nested property access", function () {
		test("with property access", async () => {
			let tempelate = {"task": {
				taskName: "{{ payload.name }}",
				workers: "{{ payload.workers }}"
			}};
			let context = { payload: {
				name: "foo",
				workers: ["worker1", "worker2", "worker3"]
			}};
			let engine = new TempelateEngine(tempelate, context);
			engine.render();
			assume(engine.getTempelate()).deep.equals({
				"task": {
					taskName: context.payload.name,
					workers: context.payload.workers
				}});
		});

		test("with index access", async() => {
			let tempelate = {a:{b:{c:"{{ payload.a.b.c.1 }}"}}}
			let context = {payload:{a:{b:{c:[1,2,3]}}}};
			let engine = new TempelateEngine(tempelate, context);
			engine.render();
			assume(engine.getTempelate()).deep.equals({a:{b:{c:2}}});
		});

		test("with multiple context properties", async() => {
			let tempelate = {
				a: "{{ payload.a.b.c }}",
				b: "{{ header.a.b.c }}"
			};
			let context = {
				payload: {a:{b:{c:1}}},
				header: {a:{b:{c:1}}}
			};
			let engine = new TempelateEngine(tempelate, context);
			engine.render();
			assume(engine.getTempelate()).deep.equals({a: 1, b: 1});
		});
	});

});
