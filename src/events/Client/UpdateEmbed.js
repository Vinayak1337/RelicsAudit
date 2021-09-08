const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class UpdateEmbed extends Listener {
	constructor() {
		super('updateEmbed', {
			emitter: 'client',
			event: 'updateEmbed',
		});
	}

	async exec() {
		try {
			const guild = this.client.guilds.cache.get('328479586297839618');
			const players = await this.client.players.items.map(item => item);
			const eligiblePlayers = players.filter(player => player.ladder['328479586297839618']).sort((a, b) => b.trophies - a.trophies).map(player => {
				if (!(player.id || guild.members.cache.has(player.id))) {
					player.notEligible = true;
					return player;
				}
				return player;
			});
			const clubs = this.client.clubs.items.first().clubs;
			const ind = eligiblePlayers.filter(player => {
				const playerClub = clubs.find(club => player.club.tag === club.tag);
				if (!playerClub) return null;
				return playerClub.subregion === 'INDIA';
			}).slice(0, 20);
			const pak = eligiblePlayers.filter(player => {
				const playerClub = clubs.find(club => player.club.tag === club.tag);
				if (!playerClub) return null;
				return playerClub.subregion === 'PAKISTAN';
			}).slice(0, 10);
			const bd = eligiblePlayers.filter(player => {
				const playerClub = clubs.find(club => player.club.tag === club.tag);
				if (!playerClub) return null;
				return playerClub.subregion === 'BANGLADESH';
			}).slice(0, 10);
			const channel = guild.channels.cache.get('827217082529218607');
			const msg = channel.messages.cache.first() || await channel.messages.fetch('827233955425157200');
			await msg.edit({ embeds: [
				new MessageEmbed().setTitle('Relics INDIA Leaderboard').setColor(this.client.blue).setDescription(`${ind.map((m, i) => {
					return `\`${i + 1})\` **[${m.name}](https://www.starlist.pro/stats/profile/${m.tag.slice(1)})** - 🏆 **${m.trophies}**${m.notEligible ? ' ❗' : ''}`;
				}).join('\n')}`),
				new MessageEmbed().setTitle('Relics PAKISTAN Leaderboard').setColor(this.client.blue).setDescription(`${pak.map((m, i) => {
					return `\`${i + 1})\` **[${m.name}](https://www.starlist.pro/stats/profile/${m.tag.slice(1)})** - 🏆 **${m.trophies}**${m.notEligible ? ' ❗' : ''}`;
				}).join('\n')}`),
				new MessageEmbed().setTitle('Relics BANGLADESH Leaderboard').setColor(this.client.blue).setDescription(`${bd.map((m, i) => {
					return `\`${i + 1})\` **[${m.name}](https://www.starlist.pro/stats/profile/${m.tag.slice(1)})** - 🏆 **${m.trophies}**${m.notEligible ? ' ❗' : ''}`;
				}).join('\n')}`),
				new MessageEmbed().setColor(this.client.red).setDescription(`Updated on <t:${Math.round(Date.now() / 1000)}:F>\`\`\`yaml\nNote: ❗ Indicates that the player has not joined discord server.\`\`\``),
			] });
			this.updateClubsEmbed();
		}
		catch (error) {
			this.client.emit('error', error);
		}
	}

	async updateClubsEmbed() {
		try {
			const filterTag = this.client.componentHandler.getModule('filterTag');
			const formatNumber = this.client.componentHandler.getModule('formatNumber');
			let int = 0;
			// const addedThumbnail = false;
			let addedTitle = false;
			// Getting clubs with only required data
			const clubs = this.client.clubs.items.filter(c => c.club.members.length && c.club.name.startsWith('Relics')).map(c => {
				const club = c.club;
				const clubData = { tag: club.tag, name: club.name, trophies: club.trophies, requiredTrophies: club.requiredTrophies, type: club.type, president: club.members.find(m => m.role === 'president'), size: club.members.length };
				if (!clubData.president) return;
				return clubData;
			});
			// Removing clubs which dont exist
			const filteredClubs = clubs.filter(c => c).sort((a, b) => b.trophies - a.trophies) ;
			// Making pair of 24 clubs so that one embed can only have 24 fields
			const pairedClubs = filteredClubs.reduce((acc, club) => {
				if (acc[int].length > 17) {
					int += 1;
					acc.push([club]);
					return acc;
				}
				else {
					acc[int].push(club);
					return acc;
				}
			}, [[]]);

			const embeds = [];
			// eslint-disable-next-line no-shadow
			for (const clubs of pairedClubs) {
				const em = new MessageEmbed().setColor(this.client.blue);
				if (!addedTitle) {
					addedTitle = true;
					em.setTitle('Official Clubs');
				}
				em.addFields(clubs.map(club => {
					return { name: `<:Club:744639272426012704> ${club.name}`, value: `**#️⃣ [${club.tag}](https://brawlify.com/stats/club/${filterTag.exec(club.tag)})\n<:Trophy:744638012692103278> ${formatNumber.exec(club.trophies)}\n<:RTrophy:744638043457323099> ${formatNumber.exec(club.requiredTrophies)}\n<:Social:744637128763375736> ${club.size}/100\n<:Crown:745917589234122752> [${club.president.name}](https://brawlify.com/stats/profile/${filterTag.exec(club.president.tag)})**`, inline: true };
				}));
				embeds.push(em);
			}
			this.updateEmbeds(embeds, clubs, formatNumber, embeds.length + 1);
		}
		catch (error) {
			this.client.emit('error', error);
		}
	}

	/**
		 *@param {Array<Object>} clubs
		 * @param {Array<MessageEmbed>} embeds
		 */
	async updateEmbeds(embeds, clubs, formatNumber, length) {
		const filterText = this.client.componentHandler.getModule('filterText');
		try {
			const totalClubs = clubs.length;
			const totalTrophies = clubs.reduce((acc, club) => +acc + +club.trophies, 0);
			const totalMembers = clubs.reduce((acc, club) => +acc + +club.size, 0);

			const statsEm = new MessageEmbed().setTitle('Relics ❯ Brawl Stars Stats').setColor(this.client.blue).addFields([
				{ name: 'Total Clubs', value: `**<:Club:744639272426012704> ${totalClubs}**`, inline: true },
				{ name: 'Total Trophies', value: `**<:Trophy:744638012692103278> ${formatNumber.exec(totalTrophies)}**`, inline: true },
				{ name: 'Total Members', value: `**<:Social:744637128763375736> ${formatNumber.exec(totalMembers)}/${formatNumber.exec(totalClubs * 100)}**`, inline: true },
				{ name: '\u200b', value: `**⏲️** <t:${Math.round(Date.now() / 1000)}:F>`, inline: true },
			]);

			embeds.unshift(statsEm);
			const docs = this.client.clubs.items.filter(c => c.verified).map(c => c);
			// eslint-disable-next-line no-inner-declarations
			function getMember(member) {
				return `\`#${member.rank}\` [${member.name}](https://brawlify.com/stats/profile/${member.tag.slice(1)})`;
			}

			for (const doc of docs) {
				const embedChannel = this.client.channels.cache.get(doc.channels.embed);
				if (!embedChannel) continue;

				const club = doc.club;
				const clubMembers = club.members.map((member, i) => { return { ...member, rank: i + 1 };});
				const members = clubMembers.filter(m => m.role === 'member');
				const topMembers = members.slice(0, 5);
				const seniors = clubMembers.filter(m => m.role === 'senior');
				const topSeniors = seniors.slice(0, 5);
				const presidents = clubMembers.filter(m => m.role.toLowerCase().includes('president'));
				const topPresidents = presidents.slice(0, 5);
				const types = {
					'open': 'Open',
					'closed': 'Closed',
					'inviteOnly': 'Invite Only',
				};
				const president = presidents.find(p => p.role === 'president');
				const avgMemTrophies = formatNumber.exec(Math.round(club.members.reduce((acc, member) => +acc + +member.trophies, 0) / club.members.length));

				const clubEmbed = new MessageEmbed().setColor(this.client.blue).setTitle(`${club.name} Stats`).setURL(`https://brawlify.com/stats/club/${club.tag.slice(1)}`).addFields([
					{ name: 'Trophies', value: `**<:Trophy:744638012692103278> ${formatNumber.exec(club.trophies)}**`, inline: true },
					{ name: 'Required Trophies', value: `**<:RTrophy:744638043457323099> ${formatNumber.exec(club.requiredTrophies)}**`, inline: true },
					{ name: 'Type', value: `**<:type:861221710736261132> ${club.type.replace(/open|closed|inviteOnly/g, type => types[type])}**`, inline: true },
					{ name: 'Total Members', value: `**<:Social:744637128763375736> ${club.members.length}/100**`, inline: true },
					{ name: 'Average Trophies', value: `**<:Trophy:744638012692103278> ${avgMemTrophies}**`, inline: true },
					{ name: 'President', value: `**<:Crown:745917589234122752> ${getMember(president)}**`, inline: true },
					{ name: `Top Members (${topMembers.length}/${members.length})`, value: `**${topMembers.map(member => getMember(member)).join('\n')}**`, inline: true },
					{ name: `Top Seniors (${topSeniors.length}/${seniors.length})`, value: `**${topSeniors.map(member => getMember(member)).join('\n')}**`, inline: true },
					{ name: `Top Presidents (${topPresidents.length}/${presidents.length})`, value: `**${topPresidents.map(member => getMember(member)).join('\n')}**`, inline: true },
				]).setTimestamp(Date.now());
				if (club.description) clubEmbed.setDescription(`**Description:**\n\`\`\`yaml\n${filterText.exec(club.description, { isDesc: true })}\n\`\`\``);
				embeds[length] = clubEmbed;

				embeds[0].setThumbnail(embedChannel.guild.iconURL({ dynamic: true }));
				let msgs = embedChannel.messages.cache.filter(m => m.author.id === this.client.user.id).map(m => m).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
				if (!msgs?.length) msgs = (await embedChannel.messages.fetch()).filter(m => m.author.id === this.client.user.id).map(m => m).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
				if (!msgs?.length) {
					for (const em of embeds) await embedChannel.send({ embeds: [em] });
					continue;
				}
				if (msgs.length > embeds.length) {
					msgs.reverse();
					const msgs2Delete = msgs.slice(embeds.length);
					(async () => {
						for (const toDelete of msgs2Delete) await toDelete.delete();
					})();
					msgs = msgs.slice(0, embeds.length);
					msgs.reverse();
				}

				for (const i in embeds) {
					const msg = msgs[i];
					const embed = embeds[i];
					if(!msg) await embedChannel.send({ embeds: [embed] });
					else await msg.edit({ embeds: [embed] });
				}
			}
		}
		catch (error) {
			this.client.emit('error', error);
		}
	}
}

module.exports = UpdateEmbed;