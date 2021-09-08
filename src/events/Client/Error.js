const { Listener } = require('discord-akairo');

class ClientError extends Listener {
	constructor() {
		super('clientError', {
			event: 'error',
			emitter: 'client',
		});
	}

	exec(error) {
		this.client.channels.cache.get('760606144845709312')?.send(`Error:\n\`\`\`js\n${error.toString()}\n\`\`\``);
	}
}

module.exports = ClientError;