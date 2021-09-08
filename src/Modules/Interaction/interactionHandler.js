const { AkairoHandler } = require('discord-akairo');
// eslint-disable-next-line no-unused-vars
const { SelectMenuInteraction } = require('discord.js');
const InteractionMenu = require('./interaction');

class InteractionHandler extends AkairoHandler {
	constructor(client, options) {
		super(client, {
			directory: options.directory,
			classToHandle: InteractionMenu,
		});
	}

	start() {
		this.client.on('interactionCreate', this.handleInteraction);
	}

	/**
     * @param {SelectMenuInteraction} interaction
     */
	handleInteraction(interaction) {
		if (!(interaction.isSelectMenu() || interaction.inGuild())) return;
		const customId = interaction.customId;
		const module = this.getModule(customId);
		if (module) return module.exec(interaction);
		return null;
	}

	/**
	 * @param {string} id
	 * @returns {InteractionMenu} Interaction
	 */
	getModule(id) {
		return this.modules.get(id);
	}
}

module.exports = InteractionHandler;