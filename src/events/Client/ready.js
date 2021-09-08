const { Listener } = require('discord-akairo');

class ready extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			type: 'once',
		});
	}

	async exec() {
		const owners = (await this.client.globals.first()).settings.owners;
		for (const id of owners) if (!this.client.ownerID.includes(id)) this.client.ownerID.push(id);
		console.log(`Logged in as ${this.client.user.tag}.`);
		this.client.user.setPresence({
			status: 'online',
			activities: [{
				name: 'Audit 2.0 on progress',
				type: 'PLAYING',
			}, {
				name: 'Dev: Vinayak#0001',
				type: 'PLAYING',
			}, {
				name: `Over ${this.client.guilds.cache.size} servers & ${this.client.users.cache.size} users`,
				type: 'WATCHING',
			}],
		});
		this.client.requestHandler.getModule('requestManager').start();
		this.client.componentHandler.getModule('blacklistManager').start();
		this.client.componentHandler.getModule('ladderManager').start();
	}
}

module.exports = ready;