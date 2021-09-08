const { Listener } = require('discord-akairo');
const PlayerUpdateManager = require('../../PlayerManager/playerUpdateManager');
const ResponseManager = require('../../PlayerManager/responseManager');

class guildMemberAdd extends Listener {
	constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
		});
	}

	get messageBuilder() { return this.client.componentHandler.getModule('messageBuilder'); }

	async exec(member) {
		try {
			const guild = member.guild;
			if (!this.client.clubs.items.find(g => g.id === guild.id)?.verified) return;
			const doc = await this.client.clubs.getDocument(guild.id);
			let player = await this.client.players.items.get(member.id);
			if (!player?.id || !player?.tag) {
				const ids = doc.channels.verification;
				const rolesToAdd = new Set();
				for (const role of doc.roles.unverified) if (!member.roles.cache.has(role)) rolesToAdd.add(role);
				await member.roles.add([...rolesToAdd]);
				const channel = guild.channels.cache.find(ch => ids.some(id => (ch.id === id) && ch.members.has(member.id)));
				if (!channel) return;
				const { content, embed, files } = this.messageBuilder.build(doc.messages.entrymessage || 'default', 'entrymessage', member.user, guild, channel, doc);
				return member.user.send({ content, embeds: [embed], files });
			}

			const playerData = await this.client.commandHandler.resolver.type('player')(null, player.tag);
			if (!(playerData.status === 200)) return console.log(playerData, 'guildMemberAdd');
			let clubData = {};
			if (playerData.club?.tag) clubData = await this.client.commandHandler.resolver.type('club')(null, playerData.club.tag);
			const updateManager = new PlayerUpdateManager(this.client, player, playerData, clubData, member);
			player = await updateManager.updatePlayer();

			const res = await this.client.verificationManager.manage(guild, player);
			const { notVerified } = new ResponseManager(res, this.client).Manage(guild);
			if (notVerified) return;

			const { content, embed, files } = this.messageBuilder.build(doc.messages.welcomemessage || 'default', 'welcomemessage', member.user, guild, '', doc, player);
			const dmch = member.user.dmChannel || await member.user.createDM(true);
			if (dmch) await dmch.send({ content, embeds: [embed], files });
		}
		catch (error) {
			console.log(error);
		}
	}
}

module.exports = guildMemberAdd;