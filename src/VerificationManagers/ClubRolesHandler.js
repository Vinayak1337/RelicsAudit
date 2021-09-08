class ClubRolesHandler {
	constructor(rolesToAdd, rolesToRemove, playerClubRole, doc, roleshandler, isServerMember) {
		this.rolesToAdd = rolesToAdd || new Set();
		this.rolesToRemove = rolesToRemove || new Set();
		this.doc = doc;
		this.playerClubRole = playerClubRole;
		this.roleshandler = roleshandler;
		this.isServerMember = isServerMember;
	}

	async setRoles(member) {
		const memberRoles = member.roles.cache.map(role => role.id);
		let rolesToSet = new Set();
		for (const role of memberRoles) {
			if (!this.rolesToRemove.has(role)) rolesToSet.add(role);
		}
		for (const role of this.rolesToAdd) rolesToSet.add(role);
		rolesToSet = [...rolesToSet];

		try {
			await member.roles.set(rolesToSet, 'Changing member roles & nick according to club he is in.');
			return true;
		}
		catch (error) {
			console.log(error);
			return error.message;
		}
	}

	filterRoles(guild) {
		const notExistedRoles = [];
		const managedRoles = [];
		const nonManageableRoles = [];

		for (const role of this.rolesToRemove) {
			if (!guild.roles.cache.has(role)) notExistedRoles.push(role);
			const roleObj = guild.roles.cache.get(role);
			if (roleObj.managed) managedRoles.push(role);
			if (!roleObj.editable) nonManageableRoles.push(role);
		}

		for (const role of this.rolesToAdd) {
			if (!guild.roles.cache.has(role)) notExistedRoles.push(role);
			const roleObj = guild.roles.cache.get(role);
			if (roleObj.managed) managedRoles.push(role);
			if (!roleObj.editable) nonManageableRoles.push(role);
		}

		if (notExistedRoles.length) {
			for (const role of notExistedRoles) {
				if (this.rolesToAdd.has(role)) this.rolesToAdd.delete(role);
				else if (this.rolesToRemove.has(role)) this.rolesToRemove.delete(role);
			}
		}

		if (managedRoles.length) {
			for (const role of managedRoles) {
				if (this.rolesToAdd.has(role)) this.rolesToAdd.delete(role);
				else if (this.rolesToRemove.has(role)) this.rolesToRemove.delete(role);
			}
		}

		if (nonManageableRoles.length) {
			for (const role of nonManageableRoles) {
				if (this.rolesToAdd.has(role)) this.rolesToAdd.delete(role);
				else if (this.rolesToRemove.has(role)) this.rolesToRemove.delete(role);
			}
		}

		return { notExistedRoles, nonManageableRoles, managedRoles };
	}

	handle() {
		switch (this.playerClubRole) {

		case 'member': {
			this.roleshandler.removeVPRoles();
			this.roleshandler.removeSeniorRoles();
		} break;

		case 'senior': {
			if (this.isServerMember) {
				this.roleshandler.addSeniorRoles();
				this.roleshandler.removeVPRoles();
			}
			else {
				this.roleshandler.removeVPRoles();
				this.roleshandler.removeSeniorRoles();
			}
		} break;

		case 'vicePresident': {
			if (this.isServerMember) {
				this.roleshandler.addVPRoles();
				this.roleshandler.removeSeniorRoles();
			}
			else {
				this.roleshandler.removeVPRoles();
				this.roleshandler.removeSeniorRoles();
			}
		}break;

		case 'president': {
			this.roleshandler.removeVPRoles();
			this.roleshandler.removeSeniorRoles();
		} break;

		}
	}
}

module.exports = ClubRolesHandler;