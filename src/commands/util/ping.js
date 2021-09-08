const { Command } = require('discord-akairo');
const { oneLine } = require('common-tags');
const { MessageEmbed } = require('discord.js');

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'util',
			description: 'Checks the bot\'s ping.',
		});
	}

	async exec(msg) {
		try {
			const em = new MessageEmbed().setColor(this.client.yellow);
			const msgOptions = {};
			msgOptions.embeds = [em.setDescription('Pinging....')];
			const pingMsg = await msg.reply(msgOptions);
			msgOptions.embeds = [em.setDescription(oneLine`
			Pong! The message round-trip took ${
	(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)
}ms.
		${this.client.ws.ping ? `The heartbeat ping is ${Math.round(this.client.ws.ping)}ms.` : ''}
	`).setColor(this.client.blue)];
			return await pingMsg.edit(msgOptions);
		}
		catch (error) {
			console.log(error);
		}
	}
}

module.exports = PingCommand;
