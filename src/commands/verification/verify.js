const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const PlayerUpdateManager = require('../../PlayerManager/playerUpdateManager');
const ResponseManager = require('../../PlayerManager/responseManager');
const NonBSManager = require('../../VerificationManagers/NonBSManager');

class VerifyCommand extends Command {
	constructor() {
		super('verify', {
			aliases: ['verify', 'cverify'],
			category: 'verification',
			description: 'Verifies a new user to the server.',
			channel: 'guild',
			ratelimit: 1,
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
		const doc = await this.client.clubs.items.find(g => g.id === msg.guild.id);
		if (!(this.client.globals.items.first().globalTeam?.includes(msg.author.id) || this.client.isOwner(msg.author.id) || await this.client.clubs.isVerifier(msg.guild.id, msg.author.id, doc) || await this.client.clubs.isManager(msg.guild.id, msg.author.id, doc))) {return 'You ain\'t a verifier';}
		if ((!msg.member.permissions.has('ADMINISTRATOR') || !this.client.isOwner(msg.author)) && !(doc.channels.verification.includes(msg.channel.id))) {
			return await msg.author.send({ content: `You can only use this command in <#${doc.channels.verification.map(id => {
				return msg.guild.channels.cache.get(id)?.toString() || id;
			}).join('>, <#')}>` });
		}
		return null;
	}

	*args() {
		const obj = yield {
			type: async (msg, tag) => {
				if (tag.toLowerCase() === 'vbp') {
					if (!msg.mentions.users.first()) return this.send(msg, 'Please mention the member to verify, please try again.');
					const member = await this.client.commandHandler.resolver.type('member')(msg, msg.content.replace(/((<@(!|\d)\d.+?>)|\W)( verify|verify) /, ''));
					if (!member) return this.send(msg, 'Provided member has either left the server or is not reachable, please try again.');
					new NonBSManager(this.client, msg.guild, member, msg.channel, msg.author).manage();
					return { toCancel: true };
				}
				if (!msg.reference) return null;
				/* this.send(msg, `Not valid, please reply to the screenshot you are verifying${!tag ? ' & provide the tag along with it, try again.' : '.'}`); */
				const refMsg = msg.channel.messages.cache.get(msg.reference.messageId) || await msg.channel.messages.fetch(msg.reference.messageId);
				if (!refMsg?.attachments?.first()?.url) return this.send(msg, `There's no screenshot in the replied message, please try again${!tag ? ' & provide the tag along with it.' : '.'}`);
				const userid = refMsg.author.id;
				let player = await this.client.players.items.get(userid);
				if (player?.tag) return this.send(msg, `User **${refMsg.author.tag}** is already verified with tag **${player.tag}**, try again or type cancel to cancel.`);

				const member = msg.guild.members.cache.get(userid);
				if (!member) return this.send(msg, `Either ${refMsg.author.tag} has left the server or i do not have access, try again or type cancel to cancel. `);
				tag = this.filterTag.exec(tag);
				if (!tag) return this.send(msg, 'Provided tag is not correct, please enter a valid tag.');
				player = await this.client.players.items.find(p => p.tag === `#${tag}`);
				if (player?.id) return this.send(msg, `The tag ${tag} is already verified with ${ (this.client.users.cache.get(player.id) || await this.client.users.fetch(player.id))?.tag || player.id}, try again or type cancel to cancel.`);

				const playerData = await this.client.commandHandler.resolver.type('player')(msg, tag);

				return { member, playerData, url: refMsg.attachments.first().url, player };
			},
			prompt:{
				start: 'Please reply to the screenshot you\'re verifying & enter tag.',
			},
		};

		return obj;
	}

	async exec(msg, args) {
		const { member, playerData, url, toCancel } = args;
		if (toCancel) return;
		if (!(playerData.status === 200)) return this.statusVerifier.exec(msg.channel, playerData.status, msg.author, playerData.tag, 'players');
		const em = new MessageEmbed().setColor(this.client.yellow).setFooter(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
		const sent = await msg.reply({ embeds: [em.setDescription('Verifying, please wait...')] });
		let clubData, player = args.player, isVerified;

		try {
			if (playerData.club.tag) clubData = await this.client.commandHandler.resolver.type('club')(msg, this.filterTag.exec(playerData.club.tag));
			if (!(clubData?.status === 200)) clubData = {};
			const updateManager = new PlayerUpdateManager(this.client, player, playerData, clubData, member, msg.author, sent, true, msg.channel.id, msg.guild.id, url);
			if (player) player = await updateManager.updatePlayer();
			else player = await updateManager.createPlayer();
			isVerified = true;
			const res = await this.client.verificationManager.manage(msg.guild, player, true);
			const { notVerified, reason, changedNick, isNickChanged, rolesChanged } = new ResponseManager(res, this.client).Manage(msg.guild);
			if (notVerified) return sent.edit({ content: `${reason}${isVerified ? '\nBut the member is saved in database as verified.' : ''}` });
			em.setAuthor(`${member.user.tag} | 🏆 ${this.formatNumber.exec(player.trophies)}`, member.user.displayAvatarURL({ dynamic: true }), `https://brawlify.com/stats/profile/${this.filterTag.exec(player.tag)}`)
				.setThumbnail(msg.guild.iconURL({ dynamic: true }))
				.setImage(this.client.image)
				.setColor(this.client.green)
				.setDescription(`${isNickChanged || rolesChanged ? `${isNickChanged ? `Nickname changed to **${this.filterText.exec(changedNick)}**` : ''}${rolesChanged ? `\nUpdated roles for ${member.toString()}` : ''}${clubData.tag ? `\nAssociated with club: **${this.filterText.exec(clubData.name)}**\nClub tag: **${this.filterText.exec(clubData.tag)}** | 🏆 **${this.formatNumber.exec(clubData.trophies)}**` : ''}` : `No updates available for ${member.toString()} in the server.`}`);

			await sent.edit({ embeds: [em] });
			const channel = await this.client.commandHandler.resolver.type('channel')(msg, '777591976639463444');
			if (channel) {
				await channel.send({ embeds: [new MessageEmbed()
					.setColor(this.client.blue).setDescription(`Member ${member.toString()} was verified by ${msg.author.toString()} in ${msg.guild.name} - ${msg.channel.toString()} with tag ${playerData.tag}`)
					.setImage(url)
					.setAuthor(`${member.user.tag} | 🏆 ${this.formatNumber.exec(player.trophies)}`, member.user.displayAvatarURL({ dynamic: true }), `https://brawlify.com/stats/profile/${this.filterTag.exec(player.tag)}`)
					.setThumbnail(msg.guild.iconURL({ dynamic: true }))
					.setFooter(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
					.addFields([
						{ name: 'Verified user', value: `\`${member.user.id}\n${member.user.tag}\``, inline: false },
						{ name: 'Verifier user', value: `\`${msg.user.id}\n${msg.user.tag}\``, inline: false },
					]),
				] });
			}
		}
		catch (error) {
			console.log(error);
			return sent.edit({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription(`Error while verification:\n\`\`\`js\n${error.message}\n\`\`\`${isVerified ? '\nBut the member is saved in database as verified.' : ''}`)] });
		}
	}

	send(msg, msgToSend) {
		msg.reply({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription(msgToSend)] });
		return null;
	}
}

module.exports = VerifyCommand;
