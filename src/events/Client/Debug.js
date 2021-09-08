const { Listener } = require('discord-akairo');

class DebugListener extends Listener {
	constructor() {
		super('debug', {
			event: 'debug',
			emitter: 'client',
		});
	}

	/**
	 *
	 * @param {string} info
	 */
	exec(info) {
		if (info.startsWith('[WS => Shard 0]')) return;
		this.client.channels.cache.get('760606144845709312')?.send(`Info:\n\`\`\`js\n${info}\n\`\`\``);
	}
}

module.exports = DebugListener;