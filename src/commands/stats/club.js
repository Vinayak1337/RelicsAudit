const { Command } = require('discord-akairo');

class Club extends Command {
	constructor() {
		super('club', {
			aliases: ['club'],
			category: '',
			description: '',
			channel: 'guild',
			ownerOnly: true,
		});
	}

	userPermissions() {
		return null;
	}

	*args() {
		const obj = yield {
			type: 'type',
			prompt: {
				start: '',
				retry: '',
			},
		};
		return { obj };
	}

	exec(msg, args) {
		return { msg, args };
	}
}

module.exports = Club;