const { Listener } = require('discord-akairo');
const ResponseManager = require('../../PlayerManager/responseManager');

class handlePlayer extends Listener {
	constructor() {
		super('handlePlayer', {
			emitter: 'client',
			event: 'handlePlayer',
		});
	}

	async exec(player) {
		const guilds = this.client.guilds.cache.filter(guild => guild.members.cache.has(player.id) && this.client.clubs.verified.includes(guild.id));
		if (!guilds.length) return;
		for (const guild of guilds) {
			const res = await this.client.verificationManager.handle(guild, player);
			new ResponseManager(res, this.client).Manage(guild);
		}
	}
}

module.exports = handlePlayer;