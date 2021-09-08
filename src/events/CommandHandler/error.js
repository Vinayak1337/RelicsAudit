const { Listener } = require('discord-akairo');

class CmdError extends Listener {
	constructor() {
		super('cmdError', {
			event: 'error',
			emitter: 'client',
		});
	}

	exec(error, msg, cmd) {
		this.client.channels.cache.get('760606144845709312')?.send(`Command Error:\n\`\`\`js\n${error.toString()}\n\`\`\`\nSent Message: ${msg?.content || 'no content'}${cmd ? `\nCommand id: ${cmd.id}` : ''}`);
	}
}

module.exports = CmdError;