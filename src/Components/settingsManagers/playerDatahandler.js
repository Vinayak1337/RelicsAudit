const Component = require('../../Modules/Component/Component');

class PlayerDataHandler extends Component {
	constructor() {
		super('playerDataHandler');
	}

	async createNewPlayer(member, club) {
		try {
			const player = await new this.client.players.model({ ...member, club }).save();
			this.client.players.items.set(player.tag, player);
			return player;
		}
		catch (error) {
			console.log(error, '-----Member-----', member.tag, member.name);
			throw error;
		}
	}

	async updatePlayer(member, club, eligibleForLadder) {
		try {
			const player = this.client.players.items.find(p => p.tag === member.tag);
			if (!player) return await this.createNewPlayer(member, club);
			if (!(player.name === member.name)) {
				player.lastnames.push(player.name);
			}
			if (typeof eligibleForLadder === 'boolean') {
				player.ladder['328479586297839618'] = eligibleForLadder;
			}
			player.club = club;
			player.name = member.name;
			player.trophies = member.trophies;
			await player.save();
			return player;
		}
		catch (error) {
			console.log(error);
		}
	}
}

module.exports = PlayerDataHandler;