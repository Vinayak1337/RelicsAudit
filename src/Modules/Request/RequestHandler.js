const { AkairoHandler } = require('discord-akairo');
const Request = require('./Request');

class RequestHandler extends AkairoHandler {
	constructor(client, options) {
		super(client, {
			directory: options.directory,
			classToHandle: Request,
		});
	}

	/**
	 * @param {string} id
	 * @returns {Request} Request
	 */
	getModule(id) {
		return this.modules.get(id);
	}
}

module.exports = RequestHandler;