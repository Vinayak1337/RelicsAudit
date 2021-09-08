const { Command } = require('discord-akairo');

class Members extends Command {
	constructor() {
		super('members', {
			aliases: ['members'],
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

module.exports = Members;