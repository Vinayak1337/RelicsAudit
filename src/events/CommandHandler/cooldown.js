const { Listener } = require('discord-akairo');

class Cooldown extends Listener {
	constructor() {
		super('cooldown', {
			emitter: 'commandHandler',
			event: 'cooldown',
		});
	}

	async exec(msg, command, ms) {
		try {
			await msg.author.send(`You need to wait for ${ms / 1000} seconds before accessing ${command.id}`);
		}
		catch (error) {
			this.client.emit('error', error);
		}
	}
}

module.exports = Cooldown;