const { MessageEmbed } = require('discord.js');

class ResponseManager {
	constructor(response, client) {
		this.response = response;
		this.client = client;
		this.embed = new MessageEmbed();
		this.toSend = false;
		this.verificationError = false;
		this.reason = '';
	}
	Manage(guild) {
		if (!this.response) return;
		const { verified, reason, roles, nickname, member, changedNick, doc, rolesChanged } = this.response;
		this.embed.setColor(this.client.red).setFooter(`If you can't to figure out how to fix, then please get help from ${this.client.support}.`);
		if (!verified && reason) {this.checkVerification(reason, member);}
		if (roles.notExistedRoles[0] || roles.managedRoles[0] || roles.nonManageableRoles[0]) {this.checkRoles(guild, roles, member, doc);}
		if (!nickname.changed && nickname.reason) {this.checkNickname(member, nickname.reason);}
		if (this.toSend) {
			const channel = guild.channels.cache.get(doc.channels.auditlog);
			if (channel) channel.send({ embeds: [this.embed] });
		}
		return { notVerified: this.verificationError, reason: this.reason, changedNick, isNickChanged: nickname.changed, rolesChanged };
	}
	checkVerification(reason, member) {
		this.embed.setDescription(`Could not verify **${member.user.tag}**, error:\n\`\`\`js\n${reason}\n\`\`\``);
		this.reason = `Could not verify **${member.user.tag}**, error:\n\`\`\`js\n${reason}\n\`\`\``;
		this.toSend = true;
		this.verificationError = true;
	}
	checkRoles(guild, roles, member, doc) {
		console.log(roles);
		this.embed.addField('Error while updating roles', `Few roles cannot be managed by bot for **${member.user.tag}**, please fix asap.\n${roles.notExistedRoles?.length ? `\nThese roles does not exist anymore:\n**${roles.notExistedRoles.join(', ')}**\n` : ''}${roles.managedRoles?.length ? `\nThese roles are manged, which cannot be given to anyone:\n**${roles.managedRoles.map(r => guild.roles.cache.get(r)?.name || r).join(', ')}**\n` : ''}${roles.nonManageableRoles?.length ? `\nThese roles cannot be given to anyone via bot, bcz there's postion higher than bot's hisghest role postion:\n**${roles.nonManageableRoles.map(r => guild.roles.cache.get(r)?.name || r)}**\n` : ''}\nPlease fix them asap otherwise remove from bot via \`${doc.prefix || this.client.prefix}settings\` command`);
		this.toSend = true;
	}
	checkNickname(member, reason) {
		this.embed.addField('Error while changing nickname', `There was an error while changing nickname of **${member.user.tag}**:\n\`\`\`js\n${reason}\n\`\`\``);
		this.toSend = true;
	}
}
module.exports = ResponseManager;