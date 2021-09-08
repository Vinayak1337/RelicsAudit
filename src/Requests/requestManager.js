const Request = require('../Modules/Request/Request');

class RequestManager extends Request {
	constructor() {
		super('requestManager');
		this.started = false;
	}

	get apiRequest() { return this.client.requestHandler.getModule('clubRequest'); }

	get token() {
		return process.env.KEY2;
	}

	get baseurl() {
		return this.client.baseURL(this.client);
	}

	start() {
		if (this.started) return;
		this.started = true;
		const handler = this.client.requestHandler.getModule('clubRequestHandler');
		handler.handle(this.apiRequest);
	}
}

module.exports = RequestManager;