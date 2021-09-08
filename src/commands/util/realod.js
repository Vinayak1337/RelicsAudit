const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class ReloadCommand extends Command {
	constructor() {
		super('reload', {
			aliases: ['reload'],
			args: [
				{
					id: 'commandID',
					type: 'commandAlias',
					prompt: {
						start: 'Enter the command name you want to reload.',
						retry: 'Not a valid command, try again.',
					},
				},
			],
			ownerOnly: true,
			category: 'owner',
		});
	}

	exec(message, args) {
		this.handler.reload(args.commandID);
		return message.reply({ embeds: [new MessageEmbed().setColor(this.client.blue).setDescription(`Reloaded command ${args.commandID}!`)] });
	}
}

module.exports = ReloadCommand;