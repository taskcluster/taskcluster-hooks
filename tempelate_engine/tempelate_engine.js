/*
*========usage=========
*body = {
*  name: "Jim",
*  id: "123",
*  token: "abc",
*  tasks: ["enter", "exit"]
*}
*
*tempelate = {
*  username: "{{payload.name}}",
*  clientId: "{{payload.id}}",
*  accessToken: "{{payload.token}}",
*  task: "payload.tasks.0"
*}
*
*context = {payload: body}
*
*engine = new TempelateEngine(tempelate, context);
*engine.render();
*engine.getTempelate() // returns rendered tempelete
*
*/

class TempelateEngine {
	
	constructor(tempelate, context) {
		this.tempelate = tempelate;
		this.context = context;
	}

	/* public */
	render() {
		this._render(this.tempelate)
	}

	/* private */
	_render(tempelate) {
		for (var key in tempelate) {
			if (tempelate.hasOwnProperty(key)) {
				var value = tempelate[key];
				if (typeof value === 'string' || value instanceof String) {
					tempelate[key] = this._replace(tempelate[key]);
				} else {
					this._render(tempelate[key]);
				}
			}
		}
	}

	/* private */
	_replace(parameterizedString) {
		var match = this.PARSEEXPR.exec(parameterizedString);
		if (match) {
			var replacementValue = this._fetchContextPropertyValue(match[1]);
			if (match[0] === parameterizedString) {
				return replacementValue;
			} else {
				return parameterizedString.replace(this.PARSEEXPR, replacementValue);
			}
			return replacementValue;
		}
		return parameterizedString;
	}

	/* private */
	_fetchContextPropertyValue(propertyString) {
		var propertyString = propertyString.trim();
		var keys = propertyString.split(".");
		var result = this.context;

		for (var key in keys) {
			if (keys.hasOwnProperty(key)) {
				result = result[keys[key]];
			}
		}

		return result;
	}

	/* public */
	getTempelate() {
		return this.tempelate;
	}
};

TempelateEngine.prototype.PARSEEXPR = /{{(\s*([\d\w]+\b.?\b)+\s*)}}/;

module.exports = TempelateEngine;
