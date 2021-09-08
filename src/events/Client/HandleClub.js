const { Listener } = require('discord-akairo');

class HandleClub extends Listener {
	constructor() {
		super('handleClub', {
			emitter: 'client',
			event: 'handleClub',
		});
	}

	get playerDataHandler() {
		return this.client.componentHandler.getModule('playerDataHandler');
	}

	async exec(club) {
		const doc = this.client.clubs.items.find(item => item.tag === club.tag);
		const oldClub = doc?.club;
		if (!oldClub) {
			await (new this.client.clubs.model({ tag: club.tag, club })).save();
			return this.client.emit('handleMembers', club);
		}

		const history = {
			membersLeft: [],
			membersJoined: [],
			rolesChange: [],
			namesChange: [],
			size: club.members.length,
			trophies: club.trophies,
			members: club.members.filter(member => member.role === 'member').length,
			seniors: club.members.filter(member => member.role === 'senior').length,
			presidents: club.members.filter(member => member.role === 'vicePresident').length + 1,
			timestamp: Date.now(),
		};
		let hasLogs = false;

		for (const oldMember of oldClub.members) {
			const newMember = club.members.find(member => member.tag === oldMember.tag);
			const memberObj = JSON.parse(JSON.stringify(oldMember));
			memberObj.rank = oldClub.members.indexOf(oldMember) + 1;

			if (!newMember) {
				const player = await this.playerDataHandler.updatePlayer(oldMember, { tag: '', name: '' }, false);
				this.client.players.save('logs', player);
				if (player.id) this.client.emit('handlePlayer', player);
				history.membersLeft.push(memberObj);
				hasLogs = true;
			}
		}

		for (const newMember of club.members) {
			const oldMember = oldClub.members.find(member => member.tag === newMember.tag);
			const memberObj = JSON.parse(JSON.stringify(newMember));
			let player;
			if (!oldMember || !(JSON.stringify(newMember) === JSON.stringify(oldMember))) player = await this.playerDataHandler.updatePlayer(newMember, { tag: club.tag, name: club.name });
			memberObj.rank = club.members.indexOf(newMember) + 1;

			if (!oldMember) {
				player.ladder['328479586297839618'] = false;
				this.client.players.save('logs', player);
				history.membersJoined.push(memberObj);
				if (player.id) this.client.emit('handlePlayer', player);
				hasLogs = true;
			}
			else if (!(oldMember.role === newMember.role)) {
				this.client.players.save('logs', player);
				memberObj.previousRole = oldMember.role;
				history.rolesChange.push(memberObj);
				if (player.id) this.client.emit('handleClubRole', player);
				hasLogs = true;
			}
			if (!(newMember.name === (oldMember?.name || newMember.name))) {
				if (player.id) this.client.emit('handlePlayerNick', player);
				memberObj.previousName = oldMember.name;
				history.namesChange.push(memberObj);
				hasLogs = true;
			}
		}

		for (const key of ['description', 'requiredTrophies', 'type']) {
			if (!(club[key] === oldClub[key])) {
				history[`${key}Change`] = {
					[`new${key}`]: club[key],
					[`old${key}`]: oldClub[key],
				};
				if (!hasLogs) hasLogs = true;
			}
		}

		if (hasLogs) {
			const logchannel = doc.channels.clublog || this.client.clubs.items.find(item => item.feeders.includes(club.tag))?.channels.clublog;
			for (const key of Object.keys(history)) if (Array.isArray(history[key]) && !history[key].length) delete history[key];
			this.client.emit('clubLog', history, { tag: club.tag, name: club.name }, logchannel, doc.type);
		}

		this.client.clubs.items.set(club.tag, doc);
		doc.club = JSON.parse(JSON.stringify(club));
		doc.markModified('club');
		await doc.save();
		this.client.emit('nextReq');
	}
}

module.exports = HandleClub;