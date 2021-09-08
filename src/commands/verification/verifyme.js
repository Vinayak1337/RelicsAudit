const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const PlayerUpdateManager = require('../../PlayerManager/playerUpdateManager');
const ResponseManager = require('../../PlayerManager/responseManager');

class VerifymeCommand extends Command {
	constructor() {
		super('verifyme', {
			aliases: ['verifyme', 'cverifyme'],
			category: 'verification',
			description: 'Updates roles & nickname for the command user.',
			channel: 'guild',
			ratelimit: 1,
			cooldown: 3000,
		});
	}

	get statusVerifier() { return this.client.componentHandler.getModule('statusVerifier'); }
	get filterTag() { return this.client.componentHandler.getModule('filterTag'); }
	get filterText() { return this.client.componentHandler.getModule('filterText'); }
	get formatNumber() { return this.client.componentHandler.getModule('formatNumber'); }
	get messageBuilder() { return this.client.componentHandler.getModule('messageBuilder'); }

	async exec(msg) {
		const verified = this.client.clubs.verified.includes(msg.guild.id);
		if (!verified) return;
		const member = msg.member;
		const doc = await this.client.clubs.getDocument(msg.guild.id);
		if ((!member.permissions.has('ADMINISTRATOR') || !this.client.isOwner(msg.author)) && !(doc.channels.verification.includes(msg.channel.id))) {
			return await msg.author.send({ content: `You can only use this command in <#${doc.channels.verification.map(id => {
				return msg.guild.channels.cache.get(id)?.toString() || id;
			}).join('>, <#')}>` });
		}

		const em = new MessageEmbed().setColor(this.client.yellow).setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true })).setFooter(this.client.user.tag, this.client.user.displayAvatarURL({ dynamic: true }));
		let player = await this.client.players.items.get(member.user.id);
		if (!player?.id || !player?.tag) {
			const msgBuilded = this.messageBuilder.build(doc.messages.noticemessage, 'noticemessage', msg.author, msg.guild, msg.channel, doc);
			const { content, embed, files } = msgBuilded;
			return msg.reply({ content, embeds: [embed], files });
		}

		const playerData = await this.client.commandHandler.resolver.type('player')(msg, this.filterTag.exec(player.tag));

		if (!(playerData.status === 200)) return this.statusVerifier.exec(msg.channel, playerData.status, msg.author, playerData.tag, 'players');
		const sent = await msg.reply({ embeds: [em.setDescription('Updating, please wait...')] });
		let clubData = {}, isVerified = false;

		try {
			delete playerData.status;
			if (playerData.club.tag) clubData = await this.client.commandHandler.resolver.type('club')(msg, this.filterTag.exec(playerData.club.tag));

			const updateManager = new PlayerUpdateManager(this.client, player, playerData, clubData, member, msg.author, sent);
			// const updateAvailable = updateManager.auditPlayer();
			// if (!updateAvailable) return;
			player = await updateManager.updatePlayer();

			isVerified = true;
			const res = await this.client.verificationManager.manage(msg.guild, player);
			const { notVerified, reason, changedNick, isNickChanged, rolesChanged } = new ResponseManager(res, this.client).Manage(msg.guild);
			if (notVerified) return sent.edit({ content: `${reason}${isVerified ? '\nBut your data has been updated in our database.' : ''}` });

			em.setAuthor(`${member.user.tag} | 🏆 ${this.formatNumber.exec(player.trophies)}`, member.user.displayAvatarURL({ dynamic: true }), `https://brawlify.com/stats/profile/${this.filterTag.exec(player.tag)}`)
				.setThumbnail(msg.guild.iconURL({ dynamic: true }))
				.setImage(this.client.image)
				.setColor(this.client.green)
				.setDescription(`${isNickChanged || rolesChanged ? `${isNickChanged ? `Nickname changed to **${this.filterText.exec(changedNick)}**\n` : ''}${rolesChanged ? `Updated roles for ${member.toString()}\n` : ''}${playerData.club.tag ? `Associated with club: **${this.filterText.exec(clubData.name)}**\nClub tag: **${this.filterText.exec(clubData.tag)}** | 🏆 **${this.formatNumber.exec(clubData.trophies)}**` : ''}` : 'No updates available for you in the server.'}`);

			return sent.edit({ embeds: [em] });
		}
		catch (error) {
			console.log(error);
			return sent.edit({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription(`Error while updating roles:\n\`\`\`js\n${error.message}\n\`\`\``)] });
		}
	}
}

module.exports = VerifymeCommand;
