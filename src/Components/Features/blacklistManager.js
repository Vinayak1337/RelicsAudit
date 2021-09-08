const { MessageEmbed } = require('discord.js');
const Component = require('../../Modules/Component/Component');

class BlacklistManager extends Component {
	constructor() {
		super('blacklistManager');
	}

	get filterTag() { return this.client.componentHandler.getModule('filterTag'); }

	start() {
		setInterval(() => {
			const blacklisteds = this.client.clubs.items.filter(item => item.blacklist.length).map(item => {
				return { tag: item.tag, blacklist: item.blacklist };
			});

			const members = this.client.clubs.items.map(item => {
				const clubMembers = item.club.members.map((member, i) => {
					return { ...member, club: { tag: item.club.tag, name: item.club.name }, rank: i + 1 };
				});
				return clubMembers;
			}).flat();

			for (const item of blacklisteds) {
				for (const blacklistedTag of item.blacklist) {
					const blacklistedMember = members.find(m => m.tag === blacklistedTag);
					if (!blacklistedMember) continue;

					const blacklistINTag = blacklisteds.find(data => data.blacklist.includes(blacklistedTag)).tag;
					const doc = this.client.clubs.items.get(blacklistINTag);
					switch (doc.type) {
					case 'HUB': {
						const channels = [doc.channels.bandodger];
						const clubBanDodger = this.client.clubs.items.find(c => !(c.type === 'HUB') && c.tag === blacklistedMember.club.tag)?.channels?.bandodger || this.client.clubs.items.find(c => !(c.type === 'HUB') && c.feeders.includes(blacklistedMember.club.tag))?.channels?.bandodger;
						if (clubBanDodger) channels.push(clubBanDodger);
						if (!channels.length) continue;
						this.sendNotification(blacklistedMember, channels, doc);
					}break;

					default: {
						const bandodger = doc.channels?.bandodger || this.client.clubs.items.find(c => !(c.type === 'HUB') && c.feeders.includes(blacklistedMember.club.tag))?.channels?.bandodger;
						if (!bandodger) continue;
						this.sendNotification(blacklistedMember, [bandodger], doc);
					}
					}
				}
			}
		}, 3.6e+6);
	}

	sendNotification(member, chs, doc) {
		switch (doc.type) {
		case 'HUB': {
			const em = new MessageEmbed().setColor(this.client.red).setDescription('New threat has entered.').addFields([
				{ name: 'In-Game-Name', value: `[${member.name}](https://brawlify.com/stats/profile/${this.filterTag.exec(member.tag)})`, inline: true },
				{ name: 'Tag', value: `${member.tag}`, inline: true },
				{ name: 'Trophies', value: `${member.trophies}`, inline: true },
				{ name: 'In Club', value: `[${member.club.name}](https://brawlify.com/stats/club/${this.filterTag.exec(member.club.tag)})`, inline: true },
				{ name: 'Rank In Club', value: `${member.rank}`, inline: true },
			]).setFooter('Please keep your club clean by kicking these threats.');

			const channel = this.client.channels.cache.get(chs[0]);
			if (channel) {
				const hubRole = channel.guild.roles.cache.get(doc.clubs.find(c => c.tag === member.club.tag)?.role);
				channel.send({ content: hubRole?.toString() || '', embeds: [em.setAuthor(channel.guild.name).setThumbnail(channel.guild.iconURL({ dynamic: true }))] });
			}
			if (chs[1]) {
				const hubCh = this.client.channels.cache.get(chs[1]);
				if (!hubCh) return;
				hubCh.send({ content: hubCh.guild.roles.everyone.toString(), embeds: [em.setAuthor(hubCh.guild.name).setThumbnail(hubCh.guild.iconURL({ dynamic: true }))] });
			}
		} break;
		default: {
			const hubCh = this.client.channels.cache.get(chs[1]);
			const em = new MessageEmbed().setColor(this.client.red).setDescription('New threat has entered.').addFields([
				{ name: 'In-Game-Name', value: `[${member.name}](https://brawlify.com/stats/profile/${this.filterTag.exec(member.tag)})`, inline: true },
				{ name: 'Tag', value: `${member.tag}`, inline: true },
				{ name: 'Trophies', value: `${member.trophies}`, inline: true },
				{ name: 'In Club', value: `[${member.club.name}](https://brawlify.com/stats/club/${this.filterTag.exec(member.club.tag)})`, inline: true },
				{ name: 'Rank In Club', value: `${member.rank}`, inline: true },
			]).setFooter('Please keep your club clean by kicking these threats.');
			if (!hubCh) return;
			hubCh.send({ content: hubCh.guild.roles.everyone.name.toString().slice(1), embeds: [em.setAuthor(hubCh.guild.name).setThumbnail(hubCh.guild.iconURL({ dynamic: true }))] });
		}
		}
	}

	setBlacklisteds() {
		this.blacklisted = this.client.clubs.items.filter(item => item.blacklist.length).map(item => { return { tag: item.tag, blacklist: item.blacklist };});
	}
}

module.exports = BlacklistManager;