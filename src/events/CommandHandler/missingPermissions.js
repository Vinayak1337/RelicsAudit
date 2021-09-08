const { Listener } = require('discord-akairo');

class MissingPermissions extends Listener {
	constructor() {
		super('missingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions',
		});
	}

	async exec(msg, command, type, reason) {
		if (!(type === 'user')) {
			try {
				await msg.author.send(`You cannot access command ${command.id}\nIn Guild: ${msg.guild?.name || 'here'}\nReason: ${reason}`);
			}
			catch (error) {
				this.client.emit('error', error);
			}
		}
	}
}

module.exports = MissingPermissions;