const { Command } = require('discord-akairo');

class brawlers extends Command {
	constructor() {
		super('brawlers', {
			aliases: ['brawlers'],
			category: 'stats',
			description: 'Get stats of your brawlers',
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

module.exports = brawlers;