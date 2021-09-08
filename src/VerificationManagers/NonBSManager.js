/* eslint-disable no-shadow */
const { MessageEmbed } = require('discord.js');
const RolesHandler = require('./RolesHandler');
const NicknameHandler = require('./NicknameHandler');
const ResponseManager = require('../PlayerManager/responseManager');
class NonBSManager {
	constructor(client, guild, member, channel, verifier) {
		this.client = client;
		this.guild = guild;
		this.member = member;
		this.verifier = verifier || this.client.user;
		this.channel = channel;
		this.rolesToAdd = new Set();
		this.rolesToRemove = new Set();
		this.nickname = '';
		this.memberRoles = member.roles.cache.map(r => r.id);
		this.rolesToSet = new Set();
	}

	get filterTag() { return this.client.componentHandler.getModule('filterTag'); }

	async manage() {
		const em = new MessageEmbed().setColor(this.client.yellow);
		const sent = await this.channel.send({ embeds: [em.setDescription('Verifying, please wait...')] });
		const doc = await this.client.clubs.getDocument(this.guild.id);
		const rolesHandler = new RolesHandler(this.rolesToAdd, this.rolesToRemove, doc, this.member);
		const nicknameHandler = new NicknameHandler(this.member, doc.roles.nncp);
		rolesHandler.addEventsRole();
		rolesHandler.addGeneralRoles();
		rolesHandler.removeUnverifiedRoles();
		rolesHandler.addVBPRoles();
		const oldNick = this.member.displayName;
		this.nickname = nicknameHandler.getNick(oldNick, false, false, 'Guest', doc.separator);
		const toReturn = {
			doc, member: this.member, roles: { notExistedRoles: [], managedRoles: [], nonManageableRoles: [] }, changedNick: this.nickname, nickname: {}, verified: false,
		};
		const { reason, changeable } = nicknameHandler.filterNick();
		if (reason) {toReturn.nickname = { changed: false, reason: reason };}
		else if (!changeable) {toReturn.nickname = { changed: false };}
		else if (oldNick === this.nickname) {toReturn.nickname = { changed: false };}
		else {toReturn.nickname = { changed: true };}
		if (doc.type === 'HUB') {
			rolesHandler.removeRegionRoles();
			rolesHandler.removeClubRoles();
			rolesHandler.removeSubregionRoles();
			rolesHandler.removeSeniorRoles();
			rolesHandler.removeVPRoles();
			rolesHandler.removeRelicsMemberRoles();
			rolesHandler.addGuestRoles();
		}
		else {
			rolesHandler.removeMemberRoles();
			rolesHandler.removeRelicsMemberRoles();
			rolesHandler.removeVPRoles();
			rolesHandler.removeSeniorRoles();
			rolesHandler.addGuestRoles();
		}
		this.filterRoles(this.guild, toReturn);
		const res = await this.manageMember(toReturn, oldNick);
		if (res) {
			const { notVerified, reason, changedNick, isNickChanged, rolesChanged } = new ResponseManager(res, this.client).Manage(this.guild);
			if (notVerified) {return sent.edit({ embeds: [em.setDescription(`${reason}\nBut the member is saved in database as verified.`).setAuthor(this.member.user.tag, this.member.user.displayAvatarURL({ dynamic: true })).setFooter(this.verifier.tag, this.verifier.displayAvatarURL({ dynamic: true })).setColor(this.client.blue)] });}
			em.setAuthor(`${this.member.user.tag} `, this.member.user.displayAvatarURL({ dynamic: true }))
				.setThumbnail(this.guild.iconURL({ dynamic: true }))
				.setImage(this.client.image)
				.setColor(this.client.green)
				.setDescription(`${isNickChanged || rolesChanged ? `${isNickChanged ? `Nickname changed to **${this.filterText.exec(changedNick)}**\n` : ''}${rolesChanged ? `Updated roles for ${this.member.toString()}\n` : ''}` : 'No updates available.'}`);
			return sent.edit({ embeds: [em] });
		}
	}
	filterRoles(guild, toReturn) {
		const notExistedRoles = [];
		const managedRoles = [];
		const nonManageableRoles = [];
		for (const role of this.rolesToRemove) {
			if (!guild.roles.cache.has(role)) {notExistedRoles.push(role);}
			const roleObj = guild.roles.cache.get(role) || {};
			if (roleObj.managed) {managedRoles.push(role);}
			if (!roleObj.editable) {nonManageableRoles.push(role);}
		}
		for (const role of this.rolesToAdd) {
			if (!guild.roles.cache.has(role)) {notExistedRoles.push(role);}
			const roleObj = guild.roles.cache.get(role) || {};
			if (roleObj.managed) {managedRoles.push(role);}
			if (!roleObj.editable) {nonManageableRoles.push(role);}
		}
		if (notExistedRoles.length) {
			for (const role of notExistedRoles) {
				if (this.rolesToAdd.has(role)) {this.rolesToAdd.delete(role);}
				else if (this.rolesToRemove.has(role)) {this.rolesToRemove.delete(role);}
			}
			toReturn.roles.notExistedRoles = notExistedRoles;
		}
		if (managedRoles.length) {
			for (const role of managedRoles) {
				if (this.rolesToAdd.has(role)) {this.rolesToAdd.delete(role);}
				else if (this.rolesToRemove.has(role)) {this.rolesToRemove.delete(role);}
			}
			toReturn.roles.managedRoles = managedRoles;
		}
		if (nonManageableRoles.length) {
			for (const role of nonManageableRoles) {
				if (this.rolesToAdd.has(role)) {this.rolesToAdd.delete(role);}
				else if (this.rolesToRemove.has(role)) {this.rolesToRemove.delete(role);}
			}
			toReturn.roles.nonManageableRoles = nonManageableRoles;
		}
	}
	async manageMember(toReturn, oldNick) {
		const memberRoles = this.member.roles.cache.map(role => role.id);
		for (const role of memberRoles) {
			if (!this.rolesToRemove.has(role)) {this.rolesToSet.add(role);}
		}
		for (const role of this.rolesToAdd) this.rolesToSet.add(role);
		const roles = [...this.rolesToSet];
		const memberData = {
			roles,
		};
		if (toReturn.nickname.changed) {memberData.nick = this.nickname;}
		try {
			await this.member.edit(memberData, 'Changing member roles & nick according to club he is in.');
			if (!(JSON.stringify(memberRoles) === JSON.stringify(roles)) && (JSON.stringify(this.member.roles.cache.map(role => role.id)) === JSON.stringify(roles))) {toReturn.rolesChanged = true;}
			else {toReturn.rolesChanged = false;}
			if (!(oldNick === this.member.displayName)) {toReturn.nickname = { changed: true };}
			else {toReturn.nickname = { changed: false };}
			toReturn.changedNick = this.nickname;
			toReturn.verified = true;
			return toReturn;
		}
		catch (error) {
			console.log(error);
			toReturn.verified = false;
			if (oldNick === this.member.displayName) {toReturn.nickname = { changed: false, reason: error.message };}
			else {toReturn.nickname = { changed: true };}
			if (!(JSON.stringify(memberRoles) === JSON.stringify(roles)) && (JSON.stringify(this.member.roles.cache.map(role => role.id)) === JSON.stringify(roles))) {toReturn.rolesChanged = true;}
			else {toReturn.rolesChanged = false;}
			toReturn.reason = error.message;
			return toReturn;
		}
	}
}
module.exports = NonBSManager;