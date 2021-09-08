const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const ClubRolesHandler = require('../../VerificationManagers/ClubRolesHandler');
const RolesHandler = require('../../VerificationManagers/RolesHandler');

class HandleClubRole extends Listener {
	constructor() {
		super('handleClubRole', {
			emitter: 'client',
			event: 'handleClubRole',
		});
	}

	async exec(player) {
		const guilds = this.client.guilds.cache.filter(guild => guild.members.cache.has(player.id) && this.client.clubs.verified.includes(guild.id));
		if (!guilds.length) return;
		for (const guild of guilds) {
			const doc = await this.client.clubs.getDocument(guild.id);
			const member = guild.members.cache.get(player.id);
			const rolesToAdd = new Set();
			const rolesToRemove = new Set();
			const rolesHandler = new RolesHandler(rolesToAdd, rolesToRemove, doc, member);
			let isServerMember;
			const clubtag = player.club.tag;
			if (doc.club.tag === clubtag) isServerMember = true;
			else if (doc.feeders?.includes(clubtag) || doc.clubs?.find(c => c.tag === clubtag)) isServerMember = true;
			const clubRolesHandler = new ClubRolesHandler(rolesToAdd, rolesToRemove, player.role, doc, rolesHandler, isServerMember);
			clubRolesHandler.handle();
			const unmanageable = clubRolesHandler.filterRoles();
			const changed = await clubRolesHandler.setRoles(member);

			let toSend = false;
			const em = new MessageEmbed().setColor(this.client.red).setFooter(`If you wont be able to figure out how to fix, then please get help from ${this.client.support}.`);
			if (typeof changed === 'string') {
				em.addField('Verification error', `Member **${member.user.tag}** wasn't verified due to error:\n\`\`\`js\n${changed}\n\`\`\``);
				toSend = true;
			}
			if (unmanageable.notExistedRoles?.length || unmanageable.nonManageableRoles?.length || unmanageable.managedRoles?.length) {
				em.addField('Roles unmanageable', `Few roles cannot be managed by bot for **${member.user.tag}**, please fix asap.\n${unmanageable.notExistedRoles?.length ? `\nThese roles does not exist anymore:\n**${unmanageable.notExistedRoles.join(', ')}**\n` : ''}${unmanageable.managedRoles?.length ? `\nThese roles are manged, which cannot be given to anyone remove them from the bot:\n**${unmanageable.managedRoles.map(r => {
					return guild.roles.cache.get(r)?.name || r;
				}).join(', ')}**\n` : ''}${unmanageable.nonManageableRoles?.length ? `\nThese roles cannot be given to anyone via bot, bcz there's postion higher than bot's hisghest role postion:\n**${unmanageable.nonManageableRoles.map(r => {
					return guild.roles.cache.get(r)?.name || r;
				})}` : ''}**\n\nPlease fix them asap otherwise remove from bot via \`${doc.prefix || this.client.prefix}settings\` command`);
				toSend = true;
			}
			const channel = guild.channels.cache.get(doc.channels.auditlog);
			if (channel && toSend) channel.send({ embeds: [em] });
		}
	}
}

module.exports = HandleClubRole;