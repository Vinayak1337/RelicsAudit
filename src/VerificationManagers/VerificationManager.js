/* eslint-disable no-shadow */
const ClubRolesHandler = require('./ClubRolesHandler');
const NicknameHandler = require('./NicknameHandler');
const RolesHandler = require('./RolesHandler');

class VerificationManager {
	constructor(client) {
		this.client = client;
		this.rolesToAdd = new Set();
		this.rolesToRemove = new Set();
		this.isRelicsMember = false;
		this.isServerMember = false;
		this.nickname = '';
		this.relicsClubs = client.globals.items.first().clubs;
		this.globalClubs = client.globals.items.first().globalClubs;
	}

	get filterTag() { return this.client.componentHandler.getModule('filterTag'); }

	async manage(guild, player, isNewMember = false) {
		this.reset();
		const doc = await this.client.clubs.items.find(g => g.id === guild.id);
		const member = guild.members.cache.get(player.id);
		const toReturn = {
			doc, member, roles: {
				notExistedRoles: [], managedRoles: [], nonManageableRoles: [],
			}, changedNick: this.nickname,
		};

		this.setMemberStatus(doc, player.club.tag);
		const rolesHandler = new RolesHandler(this.rolesToAdd, this.rolesToRemove, doc, member);
		const nicknameHandler = new NicknameHandler(member, doc.roles.nncp);
		const clubRolehandler = new ClubRolesHandler(this.rolesToAdd, this.rolesToRemove, player.role, doc, rolesHandler, this.isServerMember);
		if (player.role) clubRolehandler.handle();

		if (isNewMember) rolesHandler.addEventsRole();
		rolesHandler.addGeneralRoles();
		rolesHandler.removeUnverifiedRoles();
		rolesHandler.removeVBPRoles();

		const oldNick = member.displayName;
		if (!player.name) {
			const playerData = await this.client.commandHandler.resolver.type('player')(null, this.filterTag.exec(player.tag));
			if (!(playerData.status === 200)) return;
			player.name = playerData.name;
			player.save();
		}
		this.nickname = nicknameHandler.getNick(player.name, this.isRelicsMember, this.isServerMember, player.club.name, doc.separator);
		const { reason, changeable } = nicknameHandler.filterNick();
		if (reason) toReturn.nickname = { changed: false, reason: reason };
		else if (!changeable) toReturn.nickname = { changed: false };
		else if (oldNick === this.nickname) toReturn.nickname = { changed: false };
		else toReturn.nickname = { changed: true };

		if (this.isRelicsMember) {
			rolesHandler.removeGuestRoles();
			rolesHandler.addRelicsMemberRoles();
		}

		switch (doc.type) {
		case 'HUB': await this.handleHub(doc, player, rolesHandler); break;
		default: this.handleNonHub(rolesHandler); break;
		}

		this.filterRoles(guild, toReturn);

		await this.manageMember(member, toReturn, oldNick);
		return toReturn;
	}

	async handleHub(doc, player, rolesHandler) {
		if (this.isRelicsMember) {
			const inHub = doc.clubs.find(c => c.tag === player.club.tag);
			if (inHub) this.handleHubMember(doc, player, rolesHandler);
			else await this.handleDiffHubMember(doc, player, rolesHandler);
		}
		else {
			this.handleHubGuest(rolesHandler);
		}
	}

	handleHubMember(doc, player, rolesHandler) {
		let r;
		for (const club of doc.clubs) {
			if (club.tag === player.club.tag) {
				if (!rolesHandler.hasRole(club.role)) this.rolesToAdd.add(club.role);
				const subregionrole = doc.roles.subregionroles.find(s => s.id === club.subregion).role;
				r = subregionrole;
				if (!rolesHandler.hasRole(subregionrole)) this.rolesToAdd.add(subregionrole);
			}
			else {
				if (rolesHandler.hasRole(club.role)) this.rolesToRemove.add(club.role);
				const subregionrole = doc.roles.subregionroles.find(s => s.id === club.subregion).role;
				if (rolesHandler.hasRole(subregionrole) && !this.rolesToAdd.has(subregionrole)) this.rolesToRemove.add(subregionrole);
			}
		}
		if (this.rolesToRemove.has(r)) this.rolesToRemove.delete(r);
		rolesHandler.removeRegionRoles();
	}

	async handleDiffHubMember(doc, player, rolesHandler) {
		const hub = this.client.clubs.items.find(g => (g.type === 'hub') && g.clubs.find(c => c.tag == player.club.tag));
		if (!hub) return;

		for (const region of doc.roles.regionroles) {
			if ((region.id === hub.region) && !rolesHandler.hasRole(region.role)) this.rolesToAdd.add(region.role);
			else if (rolesHandler.hasRole(region.role)) this.rolesToRemove.add(region.role);
		}
		for (const club of doc.clubs) {
			if (rolesHandler.hasRole(club.role)) this.rolesToRemove.add(club.role);
			const subregionrole = doc.roles.subregionroles.find(s => s.id === club.subregion).role;
			if (rolesHandler.hasRole(subregionrole)) this.rolesToRemove.add(subregionrole);
		}
	}

	handleHubGuest(rolesHandler) {
		rolesHandler.removeRegionRoles();
		rolesHandler.removeClubRoles();
		rolesHandler.removeSubregionRoles();
		rolesHandler.removeSeniorRoles();
		rolesHandler.removeVPRoles();
		rolesHandler.removeRelicsMemberRoles();
		rolesHandler.addGuestRoles();
	}

	handleNonHub(rolesHandler) {
		if (this.isServerMember) rolesHandler.addMemberRoles();
		else if (this.isRelicsMember) rolesHandler.removeMemberRoles();
		else if (!this.isRelicsMember) this.handleNonHubGuest(rolesHandler);
	}

	handleNonHubGuest(rolesHandler) {
		rolesHandler.removeMemberRoles();
		rolesHandler.removeRelicsMemberRoles();
		rolesHandler.removeVPRoles();
		rolesHandler.removeSeniorRoles();
		rolesHandler.addGuestRoles();
	}

	reset() {
		this.rolesToAdd = new Set();
		this.rolesToRemove = new Set();
		this.isRelicsMember = false;
		this.isServerMember = false;
		this.nickname = '';
	}

	setMemberStatus(doc, clubtag) {
		if (doc.club.tag === clubtag) this.isServerMember = true;
		else if (doc.feeders?.includes(clubtag) || doc.clubs?.find(c => c.tag === clubtag)) this.isServerMember = true;
		if (this.relicsClubs.includes(clubtag)) this.isRelicsMember = true;
	}

	async manageMember(member, toReturn, oldNick) {
		const memberRoles = member.roles.cache.map(role => role.id);
		const rolesToSet = new Set();
		for (const role of memberRoles) if (!this.rolesToRemove.has(role)) rolesToSet.add(role);
		for (const role of this.rolesToAdd) if (role) rolesToSet.add(role);

		const memberData = {
			roles: [...rolesToSet],
		};
		if (toReturn.nickname.changed) memberData.nick = this.nickname;

		try {
			await member.edit(memberData, 'Changing member roles & nick according to club he is in.');
			if (!(JSON.stringify(memberRoles) === JSON.stringify(rolesToSet))) toReturn.rolesChanged = true;
			else toReturn.rolesChanged = false;
			if (!(oldNick === member.displayName)) toReturn.nickname = { changed: true };
			else toReturn.nickname = { changed: false };
			toReturn.changedNick = this.nickname;
			toReturn.verified = true;
			return toReturn;
		}
		catch (error) {
			console.log(error);
			if (!(JSON.stringify(memberRoles) === JSON.stringify(rolesToSet))) toReturn.rolesChanged = true;
			else toReturn.rolesChanged = false;
			if (!(oldNick === member.displayName)) toReturn.nickname = { changed: true };
			else toReturn.nickname = { changed: false, reason: error.message };
			toReturn.verified = false;
			toReturn.reason = error.message;
			return toReturn;
		}
	}

	filterRoles(guild, toReturn) {
		const notExistedRoles = [];
		const managedRoles = [];
		const nonManageableRoles = [];

		for (const role of this.rolesToRemove) {
			if (!role) continue;
			if (!guild.roles.cache.has(role)) notExistedRoles.push(role);
			const roleObj = guild.roles.cache.get(role);
			if (!roleObj) continue;
			if (roleObj.managed) managedRoles.push(role);
			if (!roleObj.editable) nonManageableRoles.push(role);
		}

		for (const role of this.rolesToAdd) {
			if (!role) continue;
			if (!guild.roles.cache.has(role)) notExistedRoles.push(role);
			const roleObj = guild.roles.cache.get(role);
			if (!roleObj) continue;
			if (roleObj.managed) managedRoles.push(role);
			if (!roleObj.editable) nonManageableRoles.push(role);
		}

		if (notExistedRoles.length) {
			for (const role of notExistedRoles) {
				if (this.rolesToAdd.has(role)) this.rolesToAdd.delete(role);
				else if (this.rolesToRemove.has(role)) this.rolesToRemove.delete(role);
			}
			toReturn.roles.notExistedRoles = notExistedRoles;
		}

		if (managedRoles.length) {
			for (const role of managedRoles) {
				if (this.rolesToAdd.has(role)) this.rolesToAdd.delete(role);
				else if (this.rolesToRemove.has(role)) this.rolesToRemove.delete(role);
			}
			toReturn.roles.managedRoles = managedRoles;
		}

		if (nonManageableRoles.length) {
			for (const role of nonManageableRoles) {
				if (this.rolesToAdd.has(role)) this.rolesToAdd.delete(role);
				else if (this.rolesToRemove.has(role)) this.rolesToRemove.delete(role);
			}
			toReturn.roles.nonManageableRoles = nonManageableRoles;
		}
	}

}

module.exports = VerificationManager;