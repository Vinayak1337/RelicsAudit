const { AkairoModule } = require('discord-akairo');

class Component extends AkairoModule {
	/**
	 * @param {string} id
	 * @param {{
	 * directory: string,
	 * classToHandle: Component
	 * }} options
	 */
	constructor(id, options = {}) {
		super(id, options);
	}

	exec() {
		throw new Error('Not implemented!');
	}
}

module.exports = Component;