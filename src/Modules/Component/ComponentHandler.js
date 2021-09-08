const { AkairoHandler } = require('discord-akairo');
const Component = require('./Component');

class ComponentHandler extends AkairoHandler {
	constructor(client, options) {
		super(client, {
			directory: options.directory,
			classToHandle: Component,
		});
	}

	/**
	 * @param {string} id
	 * @returns {Component} Component
	 */
	getModule(id) {
		return this.modules.get(id);
	}
}

module.exports = ComponentHandler;