const { Listener } = require('discord-akairo');

class handleMembers extends Listener {
	constructor() {
		super('handleMembers', {
			emitter: 'client',
			event: 'handleMembers',
		});
	}

	get playerDataHandler() { return this.client.componentHandler.getModule('playerDataHandler'); }

	async exec(club) {
		for (const member of club.members) {
			const player = await this.playerDataHandler.updatePlayer(member, club);
			if (player.id) this.emit('handlePlayer', player);
		}
	}
}

module.exports = handleMembers;