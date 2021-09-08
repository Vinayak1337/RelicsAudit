const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class Profile extends Command {
	constructor() {
		super('profile', {
			aliases: ['profile'],
			category: 'stats',
			description: 'Shows profile for the user',
			channel: 'guild',
			ownerOnly: false,
			ratelimit: 3,
			cooldown: 60 * 1000,
		});
	}

	userPermissions() {
		return null;
	}

	*args() {
		const player = yield {
			type: async (msg, phrase) => {
				if (!phrase) {
					const doc = this.client.players.items.find(item => item.id == msg.author.id);
					if (!doc?.tag) return this.send(msg, 'You are not verified yet, please get verified in any relics server first.');
					const tag = await this.client.componentHandler.getModule('filterTag').exec(doc.tag);
					if (!tag) return this.send(msg, `The saved tag ${tag} is not valid, please get verified again.`);
					let playerData = await this.client.commandHandler.resolver.type('player')(msg, tag);
					if (!(playerData.status == 200)) {
						if (!(playerData.status == 503)) return this.switchStatus(msg, phrase, playerData.status);
						playerData = { ...doc };
						if (!playerData?.player) return this.switchStatus(msg, phrase, 503);
						playerData.player.status = 503;
					}
					return playerData;
				}
				let user = (await this.client.commandHandler.resolver.type('member')(msg, phrase))?.user;
				if (!user) user = await this.client.commandHandler.resolver.type('user')(msg, phrase);
				if (!user) {
					const id = this.client.players.items.find(p => (p.id == phrase) || (p.name && ((p.name.toLowerCase() == phrase.toLowerCase()) || (p.name.toLowerCase().startsWith(phrase.toLowerCase())) || (p.name.toLowerCase().includes(phrase.toLowerCase())) || (p.name.toLowerCase().endsWith(phrase.toLowerCase())))))?.id;
					if (id) {
						user = await this.client.users.fetch(id);
					}
				}
				if (!user) {
					const tag = await this.client.componentHandler.getModule('filterTag').exec(phrase);
					if (!tag) return this.send(msg, `The provided tag or user \`${phrase}\` is not valid.`);
					let playerData = await this.client.commandHandler.resolver.type('player')(msg, tag);
					if (!(playerData.status == 200)) {
						if (!(playerData.status == 503)) return this.switchStatus(msg, phrase, playerData.status);
						playerData = this.client.players.items.find(item => item.tag === `#${tag}`);
						if (!playerData?.player) return this.switchStatus(msg, phrase, 503);
						playerData.player.status = 503;
					}
					return playerData;
				}
				const doc = this.client.players.items.find(item => item.id == user.id);
				if (!doc?.tag) return this.send(msg, `Provided user ${user.tag} is not verified yet.`);
				const tag = await this.client.componentHandler.getModule('filterTag').exec(doc.tag);
				if (!tag) return this.send(msg, `The saved tag ${tag} is not valid.`);
				let playerData = await this.client.commandHandler.resolver.type('player')(msg, tag);
				if (!(playerData.status == 200)) {
					if (!(playerData.status == 503)) return this.switchStatus(msg, phrase, playerData.status);
					playerData = this.client.players.items.find(item => item.tag === `#${tag}`);
					if (!playerData?.player) return this.switchStatus(msg, phrase, 503);
					playerData.player.status = 503;
				}
				return playerData;
			},
		};
		return { player };
	}

	switchStatus(msg, tag, status) {
		switch (status) {
		case 404: return this.send(msg, `Did not find any player with tag provided ${tag}, please try again.`);
		case 503: return this.send(msg, 'There is maintenance on brawl stars servers, please try again later once its over.');
		default:
		{
			if ([400, 403, 429].some(c => c === status)) return this.send(msg, `Request was aborted from brawl stars server, please report this error to ${this.client.support} with code ${status}.`);
			return this.send(msg, `Something went wrong while trying to fetch the tag ${tag}, status code ${status}, please try again`);
		}
		}
	}

	send(msg, text) {
		const em = new MessageEmbed().setColor(this.client.red).setDescription(text);
		msg.reply({ embeds: [em] });
		return null;
	}

	getName(key) {
		switch (key) {
		case '3vs3Victories': return '3vs3 Victories';
		case 'soloVictories': return 'Solo Victories';
		case 'duoVictories': return 'Duo Victories';
		case 'highestPowerPlayPoints': return 'Highest Points';
		case 'bestRoboRumbleTime': return 'Best Robo Rumble';
		}
	}

	getEmoji(key) {
		switch (key) {
		case '3vs3Victories': return '<:3v3:746330571331993601>';
		case 'soloVictories': return '<:Solo:744638409821388954>';
		case 'duoVictories': return '<:Duo:744638957140049941>';
		case 'highestPowerPlayPoints': return '<:PowerPlay:704360805558124655>';
		case 'bestRoboRumbleTime': return '<:RoboRumble:704360959967494174>';
		}
	}

	getRole(role) {
		switch (role) {
		case 'member': return 'Member';
		case 'senior': return 'Senior';
		case 'vicePresident': return 'Vice President';
		case 'president': return 'President';
		}
	}

	async exec(msg, args) {
		let { player } = args;
		const clubData = {};
		if (player.player) {
			clubData.tag = player.club.tag;
			clubData.name = player.club.name;
			clubData.role = player.role;
		}
		if (!player.player) {
			let club;
			if (player.club?.tag) club = await this.client.commandHandler.resolver.type('club')(msg, player.club.tag.slice(1));
			if (club?.status == 200) {
				clubData.tag = club.tag;
				clubData.name = club.name;
				const clubMember = club.members.find(member => member.tag === player.tag);
				clubData.role = clubMember.role;
				clubData.rank = club.members.indexOf(clubMember, 1) + 1;
			}
		}

		if (player.player) player = { ...player.player };
		const formatNumber = this.client.componentHandler.getModule('formatNumber');
		const doc = this.client.players.items.find(item => item.tag === player.tag);
		const em = new MessageEmbed().setColor(this.client.green)
			.setAuthor(`${player.name} | ${player.tag}`, 'https://cdn.discordapp.com/attachments/744637281318469752/861526648624250930/bs-account.png', `https://brawlify.com/stats/profile/${player.tag?.slice(1)}`);
		if (player.trophies) {
			em.addFields([
				{ name: 'Trophies', value: `**<:Trophy:744638012692103278> ${formatNumber.exec(player.trophies)}**`, inline: true },
				{ name: 'Highest Trophies', value: `**<:trophies:861926896634560512> ${formatNumber.exec(player.highestTrophies)}**`, inline: true },
			]);
		}

		const lv = player.expLevel;
		const XPn = (40 + ((lv - 1) * 10));
		const totalExp = ((lv / 2) * (40 + XPn));
		const remainingXpToGain = totalExp - player.expPoints;
		const gainedXpInXPn = XPn - remainingXpToGain;
		em.addFields([
			{ name: 'Experience', value: `**<:XP:744795073337884743> ${formatNumber.exec(player.expLevel)} - (${formatNumber.exec(gainedXpInXPn)}/${formatNumber.exec(XPn)})**`, inline: true },
			{ name: 'Qualified for Championship', value: `**<:Championship:744637385798582333> ${player.isQualifiedFromChampionshipChallenge ? '<:yes:861926300741271565>' : '<:no:746330523445755906>'}**`, inline: true },
		]);

		const rrLevels = ['Normal', 'Hard', 'Expert', 'Master', 'Insane', 'Insane II', 'Insane III', 'Insane IV', 'Insane V', 'Insane VI', 'Insane VII', 'Insane VIII', 'Insane IX', 'Insane X', 'Insane XI', 'Insane XII', 'Insane XIII', 'Insane XIV', 'Insane XV', 'Insane XVI'];
		const arr = ['3vs3Victories', 'soloVictories', 'duoVictories', 'bestRoboRumbleTime', 'highestPowerPlayPoints'];
		for (const key of arr) {
			if(player[key]) em.addField(`${this.getName(key)}`, `**${this.getEmoji(key)} ${key === 'bestRoboRumbleTime' ? rrLevels[player[key] - 1] : formatNumber.exec(player[key])}**`, true);
		}
		const brawlers = this.client.brawlers.items;
		const totalGadgets = brawlers.reduce((acc, brawler) => acc + brawler.gadgets.length, 0);
		const totalSPs = brawlers.reduce((acc, brawler) => acc + brawler.starPowers.length, 0);
		const playerGadgets = player.brawlers.reduce((acc, brawler) => acc + brawler.gadgets.length, 0);
		const playerStarPowers = player.brawlers.reduce((acc, brawler) => acc + brawler.starPowers.length, 0);

		em.addField('Total Brawlers', `**<:brawlers:862023534461190215> ${player.brawlers.length}/${brawlers.length}**`, true);
		if (playerStarPowers) em.addField('Total Star Powers', `**<:starPower:863087573948825630> ${playerStarPowers}/${totalSPs}**`, true);
		if (playerGadgets) em.addField('Total Gadgets', `**<:gadget:863087633302290442> ${playerGadgets}/${totalGadgets}**`, true);
		if (clubData.tag) {
			em.addField('Club', `**<:Club:744639272426012704> [${clubData.name}](https://brawlify.com/stats/club/${clubData.tag.slice(1)})**`, true);
			if (clubData.role) em.addField('Role', `**🏅 ${this.getRole(clubData.role)}**`, true);
			if (clubData.rank) em.addField('Rank in Club', `<:leaderboards:862027737279496273> \`#${clubData.rank}\``, true);
		}

		let user;
		if (doc.id) user = this.client.users.cache.get(doc?.id) || await this.client.users.fetch(doc?.id);
		if (doc.lastnames.length) em.addField('Last names', `**${doc.lastnames.join('\n')}**`, true);
		if (user) em.addField('Discord Info', `ℹ️ [\`${user.tag}\`](https://discord.com/users/${user.id})`, true);
		if (player.status == 503) em.setFooter('There is maintenance going on in brawl stars. The current profile is from our database which can be old.');
		msg.reply({ embeds: [em] });
	}
}

module.exports = Profile;

/**
 *  @interface Player {
 *	 tag:                                  string;
 *	 name:                                 string;
 *	 icon:                                 Icon;
 *	 trophies:                             number;
 *	 highestTrophies:                      number;
	 expLevel:                             number;
	 expPoints:                            number;
	 isQualifiedFromChampionshipChallenge: boolean;
	 "3vs3Victories":                      number;
	 soloVictories:                        number;
	 duoVictories:                         number;
	 bestRoboRumbleTime:                   number;
	 bestTimeAsBigBrawler:                 number;
	 club:                                 Club;
	 brawlers:                             Brawler[];
	 nameColor?:                           string;
	 highestPowerPlayPoints?:              number;
	}

	@interface Brawler {
		id:              number;
		name:            string;
		power:           number;
		rank:            number;
		trophies:        number;
		highestTrophies: number;
		starPowers:      Gadget[];
		gadgets:         Gadget[];
	}

	@interface Gadget {
		id:   number;
		name: string;
	}

	@interface Club {
		tag?:  string;
		name?: string;
	}

	@interface Icon {
		id: number;
	}
*/
