const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const PlayerUpdateManager = require('../../PlayerManager/playerUpdateManager');
const ResponseManager = require('../../PlayerManager/responseManager');
class ReroleCommand extends Command {
	constructor() {
		super('rerole', {
			aliases: ['rerole', 'crerole'],
			category: 'verification',
			description: 'Updates roles & nickname for the given user.',
			channel: 'guild',
			ratelimit: 3,
			cooldown: 3000,
		});
	}

	get statusVerifier() { return this.client.componentHandler.getModule('statusVerifier'); }
	get filterTag() { return this.client.componentHandler.getModule('filterTag'); }
	get filterText() { return this.client.componentHandler.getModule('filterText'); }
	get formatNumber() { return this.client.componentHandler.getModule('formatNumber'); }

	async userPermissions(msg) {
		const verified = this.client.clubs.verified.includes(msg.guild.id);
		if (!verified) return 'Server is not verified';
		const doc = await this.client.clubs.getDocument(msg.guild.id);
		if (!(this.client.globals.items.first().globalTeam?.includes(msg.author.id) || this.client.isOwner(msg.author.id) || await this.client.clubs.isVerifier(msg.guild.id, msg.author.id, doc) || await this.client.clubs.isManager(msg.guild.id, msg.author.id, doc))) { return 'You ain\'t a verifier'; }
		if (!(msg.member.permissions.has('ADMINISTRATOR') || this.client.isOwner(msg.author)) && !(doc.channels.verification.includes(msg.channel.id))) {
			return await msg.author.send({
				content: `You can only use this command in <#${doc.channels.verification.map(id => {
					return msg.guild.channels.cache.get(id)?.toString() || id;
				}).join('>, <#')}>`,
			});
		}
		return null;
	}

	*args() {
		const obj = yield {
			type: async (msg, phrase) => {
				if (!phrase) return this.send(msg, 'Not a valid member, please try again.');
				const member = this.handler.resolver.type('member')(msg, phrase);
				if (!member) return this.send(msg, 'Not a valid member, please try again.');
				const player = await this.client.players.items.get(member.user.id);
				if (!player?.id || !player?.tag) return this.send(msg, `${member.user.tag} is not verified. Please verify him first. Type cancel to cancel this command or enter another user to update.`);

				const playerData = await this.client.commandHandler.resolver.type('player')(msg, player.tag);

				return { member, playerData, player };
			},
			prompt: {
				start: 'Please enter the member you want to update roles for.',
			},
		};

		return obj;
	}

	async exec(msg, args) {
		const { member, playerData } = args;
		if (!(playerData.status === 200)) return this.statusVerifier.exec(msg.channel, playerData.status, msg.author, playerData.tag, 'players');
		const em = new MessageEmbed().setColor(this.client.yellow).setFooter(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
		const sent = await msg.reply({ embeds: [em.setDescription('Updating, please wait...')] });
		let clubData, player = args.player, isVerified = false;

		try {
			if (playerData.club.tag) clubData = await this.client.commandHandler.resolver.type('club')(msg, this.filterTag.exec(playerData.club.tag));
			if (!(clubData?.status === 200)) clubData = {};

			const updateManager = new PlayerUpdateManager(this.client, player, playerData, clubData, member, msg.author, sent);
			// const updateAvailable = updateManager.auditPlayer();
			// if (!updateAvailable) return;
			player = await updateManager.updatePlayer();

			isVerified = true;
			const res = await this.client.verificationManager.manage(msg.guild, player);
			const { notVerified, reason, changedNick, isNickChanged, rolesChanged } = new ResponseManager(res, this.client).Manage(msg.guild);
			if (notVerified) return sent.edit({ content: `${reason}${isVerified ? '\nBut the member is saved in database as verified.' : ''}` });
			if (!player.trophies) console.log(player);
			em.setAuthor(`${member.user.tag} | 🏆 ${this.formatNumber.exec(player.trophies || 0)}`, member.user.displayAvatarURL({ dynamic: true }), `https://brawlify.com/stats/profile/${this.filterTag.exec(player.tag)}`)
				.setThumbnail(msg.guild.iconURL({ dynamic: true }))
				.setImage(this.client.image)
				.setColor(this.client.green)
				.setDescription(`${isNickChanged || rolesChanged ? `${isNickChanged && changedNick ? `Nickname changed to **${this.filterText.exec(changedNick)}**` : ''}${rolesChanged ? `\nUpdated roles for ${member.toString()}` : ''}${clubData.tag ? `\nAssociated with club: **${this.filterText.exec(clubData.name || 'No club')}**\nClub tag: **${this.filterText.exec(clubData.tag || 'No club')}** | 🏆 **${this.formatNumber.exec(clubData.trophies || 0)}**` : ''}` : `No updates available for ${member.toString()} in the server.`}`);

			await sent.edit({ embeds: [em] });
		}
		catch (error) {
			console.log(error);
			return sent.edit({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription(`Error while updating roles:\n\`\`\`js\n${error.message}\n\`\`\``)] });
		}
	}

	send(msg, msgToSend) {
		msg.reply({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription(msgToSend)] });
		return null;
	}
}

module.exports = ReroleCommand;
