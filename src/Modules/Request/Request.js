const { AkairoModule } = require('discord-akairo');

class Request extends AkairoModule {
	/**
	 * @param {string} id
	 * @param {{
	 * directory: string,
	 * classToHandle: Request
	 * }} options
	 */
	constructor(id, options = {}) {
		super(id, options);
	}

	exec() {
		throw new Error('Not implemented!');
	}
}

module.exports = Request;