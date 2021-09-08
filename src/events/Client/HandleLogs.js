/* eslint-disable no-shadow */
const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class handleMembers extends Listener {
	constructor() {
		super('clubLog', {
			emitter: 'client',
			event: 'clubLog',
		});
	}

	get filterTag() { return this.client.componentHandler.getModule('filterTag'); }
	get filterText() { return this.client.componentHandler.getModule('filterText'); }
	get formatNumber() { return this.client.componentHandler.getModule('formatNumber'); }

	async exec(history, club, channelID, clubType) {
		club.addedEmbed = false;
		if (!this.client.globals.items.first().sendLogs) return;
		try {
			const {
				membersLeft,
				membersJoined,
				rolesChange,
				namesChange,
				size,
				trophies,
				members,
				seniors,
				presidents,
				timestamp,
				descriptionChange,
				requiredTrophiesChange,
				typeChange,
			} = history;

			const embeds = [];

			if (membersJoined) {
				const em = this.getEmbed(club, 'membersJoined');
				em.setTitle(`Member${membersJoined.length > 1 ? 's' : ''} Joined`)
					.setDescription(`${membersJoined.map(member => `${this.polishMember(member)}${!(member.role === 'member') ? `\n🏅   **${this.capitalize(member.role)}**` : ''}`).join('\n')}`);
				embeds.push(em);
			}
			if (membersLeft) {
				const em = this.getEmbed(club, 'membersLeft');
				em.setTitle(`Member${membersLeft.length > 1 ? 's' : ''} Left`)
					.setDescription(`${membersLeft.map(member => `${this.polishMember(member)}${!(member.role === 'member') ? `\n🏅   **${this.capitalize(member.role)}**` : ''}`).join('\n')}`);
				embeds.push(em);
			}
			if (rolesChange) {
				const promoted = [];
				const demoted = [];
				for (const member of rolesChange) {
					if (this.rolePosition(member.role) > this.rolePosition(member.previousRole)) {
						promoted.push(member);
					}
					else {
						demoted.push(member);
					}
				}
				if (promoted.length) {
					const em = this.getEmbed(club, 'membersPromoted');
					em.setTitle(`Member${promoted.length > 1 ? 's' : ''} Promoted`)
						.setDescription(`${promoted.map(member => `${this.polishMember(member)}\n   \`${this.capitalize(member.role)}\` ⬅️ \`${this.capitalize(member.previousRole)}\``).join('\n')}`);
					embeds.push(em);
				}
				if (demoted.length) {
					const em = this.getEmbed(club, 'membersDemoted');
					em.setTitle(`Member${demoted.length > 1 ? 's' : ''} Demoted`)
						.setDescription(`${demoted.map(member => `${this.polishMember(member)}\n   \`${this.capitalize(member.previousRole)}\` ➡️ \`${this.capitalize(member.role)}\``).join('\n')}`);
					embeds.push(em);
				}
			}
			if (namesChange) {
				const em = this.getEmbed(club, 'namesChange');
				em.setTitle(`Member${namesChange.length > 1 ? 's' : ''} Name Change`)
					.setDescription(`${namesChange.map(member => `${this.polishMember(member)}\n   \`${this.filterText.exec(member.name, { isName: true })}\` ⬅️ \`${this.filterText.exec(member.previousName, { isName: true })}\``).join('\n')}`);
				embeds.push(em);

			}
			if (descriptionChange) {
				const em = this.getEmbed(club, 'descriptionChange');
				em.setTitle('Description Change')
					.setDescription(`\`\`\`\n${await this.filterText.exec(descriptionChange.newdescription, { isDesc: true })}\n\`\`\` ⬅️ \`\`\`\n${await this.filterText.exec(descriptionChange.olddescription, { isDesc: true })}\n\`\`\``);
				embeds.push(em);
			}
			if (requiredTrophiesChange) {
				const em = this.getEmbed(club, 'requiredTrophiesChange');
				em.setTitle('Required Trophies Change')
					.setDescription(`**To:** \`${this.formatNumber.exec(requiredTrophiesChange.newrequiredTrophies)}\` ⬅️ **From:** \`${this.formatNumber.exec(requiredTrophiesChange.oldrequiredTrophies)}\``);
				embeds.push(em);
			}
			if (typeChange) {
				const em = this.getEmbed(club, 'typeChange', typeChange.newtype);
				em.setTitle('Type Change')
					.setDescription(`**To:** \`${this.capitalize(typeChange.newtype)}\` ⬅️ **From:** \`${this.capitalize(typeChange.oldtype)}\``);
				embeds.push(em);
			}
			const em = new MessageEmbed().setColor(this.client.blue)
				.setTitle('Status')
				.setDescription(`<:Social:744637128763375736> **${size}/100**\n🏆 **${this.formatNumber.exec(trophies)}**\n\`M:\` **${members}** \`S:\` **${seniors}** \`P:\` **${presidents}**`)
				.setTimestamp(timestamp)
				.setFooter('⏲️');
			embeds.push(em);

			let channel;
			if (channelID) channel = this.client.channels.cache.get(channelID);
			if (channel) await channel.send({ embeds });
			if (!(clubType === 'HUB')) {
				const hubDoc = this.client.clubs.items.find(g => (g.type === 'HUB' && g.clubs.find(c => c.tag === club.tag)));
				if (!hubDoc) return;
				const id = hubDoc.channels.clublog;
				channel = this.client.channels.cache.get(id);
				if (channel) await channel.send({ embeds });
			}
		}
		catch (error) {
			console.log(error);
		}
	}

	getEmbed(club, historyType, value) {
		const em = new MessageEmbed()
			.setColor(this.getColor(historyType, value));
		if (!club.addedEmbed) {
			club.addedEmbed = !club.addedEmbed;
			em.setAuthor(`${club.name} Logs`, 'https://images-ext-1.discordapp.net/external/TTGDtKuMvtuguPMjF0JcXucTnE747gf-FdlenVXTzEs/%3Fv%3D1/https/cdn.starlist.pro/club/8000003.png', `https://brawlify.com/stats/club/${this.filterTag.exec(club.tag)}`);
		}
		return em;
	}

	getColor(historyType, value) {
		switch (historyType) {
		case 'membersJoined': return this.client.green;
		case 'membersLeft': return this.client.red;
		case 'membersPromoted': return this.client.green;
		case 'membersDemoted': return this.client.red;
		case 'namesChange': return this.client.yellow;
		case 'typeChange': {
			switch (value) {
			case 'open' : return this.client.green;
			case 'closed': return this.client.red;
			case 'inviteOnly': return this.client.blue;
			}
		}break;
		default: return this.client.blue;
		}
	}

	polishMember(member) {
		return `\`#${member.rank}\` **[${this.filterText.exec(member.name, { isName: true })}](https://brawlify.com/stats/profile/${this.filterTag.exec(member.tag)})** 🏆 **${this.formatNumber.exec(member.trophies)}**`;
	}

	capitalize(name) {
		switch (name) {
		case 'vicePresident': return 'Vice President';
		case 'inviteOnly': return 'Invite only';
		default: return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
		}
	}

	rolePosition(role) {
		switch (role) {
		case 'member': return 1;
		case 'senior': return 2;
		case 'vicePresident': return 3;
		case 'president': return 4;
		default: return 0;
		}
	}
}

module.exports = handleMembers;