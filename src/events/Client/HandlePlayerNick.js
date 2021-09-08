const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const NicknameHandler = require('../../VerificationManagers/NicknameHandler');

class HandlePlayerNick extends Listener {
	constructor() {
		super('handlePlayerNick', {
			emitter: 'client',
			event: 'handlePlayerNick',
		});
	}

	async exec(player) {
		const guilds = this.client.guilds.cache.filter(guild => guild.members.cache.has(player.id) && this.client.clubs.verified.includes(guild.id));
		if (!guilds.length) return;
		for (const guild of guilds) {
			const doc = await this.client.clubs.getDocument(guild.id);
			const member = guild.members.cache.get(player.id);
			const nickHandler = new NicknameHandler(member, doc.roles.nncp);
			let isRelicsMember, isServerMember;
			const clubtag = player.club.tag;
			if (doc.club.tag === clubtag) isServerMember = true;
			else if (doc.feeders?.includes(clubtag) || doc.clubs?.find(c => c.tag === clubtag)) isServerMember = true;
			if (this.client.globals.items.first().clubs.includes(clubtag)) isRelicsMember = true;
			const nickname = nickHandler.getNick(player.name, isRelicsMember, isServerMember, player.club.name, doc.separator);
			const { reason, changeable } = nickHandler.filterNick();
			let changed;
			if (changeable) changed = await nickHandler.setNick(nickname);
			if (reason || (typeof changed === 'string')) {
				const em = new MessageEmbed().setColor(this.client.red).setFooter(`If you wont be able to figure out how to fix, then please get help from ${this.client.support}.`);
				em.addField('Nickname not manageable', `There was an error while changing nickname of **${member.user.tag}**:\n\`\`\`js\n${reason || changed}\n\`\`\``);
				const channel = guild.channels.cache.get(doc.channels.auditlog);
				if (channel) channel.send({ embeds: [em] });
			}
		}
	}
}

module.exports = HandlePlayerNick;