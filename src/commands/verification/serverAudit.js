const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const ResponseManager = require('../../PlayerManager/responseManager');

class VerifyCommand extends Command {
	constructor() {
		super('serverAudit', {
			aliases: ['sa', 'sca', 'startaudit', 'serveraudit'],
			category: 'verification',
			description: 'Audits the whole server.',
			channel: 'guild',
			ratelimit: 1,
			cooldown: 3.6e+6,
		});
	}

	async userPermissions(msg) {
		const verified = this.client.clubs.verified.includes(msg.guild.id);
		if (!verified) return 'Server is not verified';
		const doc = await this.client.clubs.items.find(g => g.id === msg.guild.id);
		if (!(this.client.isOwner(msg.author.id) || await this.client.clubs.isManager(msg.guild.id, msg.author.id, doc))) {return 'You ain\'t a verifier';}
		return null;
	}

	async exec(msg) {
		try {
			const em = new MessageEmbed().setColor(this.client.yellow);
			const sent = await msg.reply({ embeds: [em.setDescription('Server audit has been started....')] });
			const playersDoc = this.client.players.items.map(item => item);
			const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
			const guildMembers = msg.guild.members.cache.filter(m => !(doc.roles.vbp.some(id => m.roles.cache.has(id)) || m.user.bot) && m.manageable).map(m => m);
			let skipped = 0, verified = 0;

			for (const member of guildMembers) {
				const player = playersDoc.find(p => p.id === member.id);
				if (!player) {
					skipped += 1;
					const rolesToSet = new Set();
					for (const role of doc.roles.unverified) rolesToSet.add(role);
					const memberRoles = member.roles.cache.map(r => r);
					for (const role of memberRoles) if (!role.editable) rolesToSet.add(role.id);
					await member.edit({ nick: member.user.username, roles: [...rolesToSet] });
					continue;
				}
				verified += 1;
				if (!player.role) player.role = member?.role;
				if (!player.club) player.club = {};
				const res = await this.client.verificationManager.manage(msg.guild, player);
				await new ResponseManager(res, this.client).Manage(msg.guild);
			}
			sent.edit({ embeds: [em.setDescription(`Server has been audited.\n**Skipped**: \`${skipped}\`\n**Verified**: \`${verified}\``)] });
		}
		catch (error) {
			console.log(error);
			return msg.reply({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription(`Error while verification:\n\`\`\`js\n${error.message}\n\`\`\``)] });
		}
	}

	send(msg, msgToSend) {
		msg.reply({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription(msgToSend)] });
		return null;
	}
}

module.exports = VerifyCommand;
