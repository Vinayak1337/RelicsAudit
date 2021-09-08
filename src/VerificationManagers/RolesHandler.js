class RolesHandler {
	constructor(rolesToAdd, rolesToRemove, doc, member) {
		this.rolesToAdd = rolesToAdd;
		this.rolesToRemove = rolesToRemove;
		this.member = member;
		this.doc = doc;
	}

	hasRole(id) {
		return this.member?.roles.cache.has(id);
	}

	removeUnverifiedRoles() {
		for (const role of this.doc.roles.unverified) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

	addUnverifiedRoles() {
		for (const role of this.doc.roles.unverified) if (role) this.rolesToAdd.add(role);
	}

	addGeneralRoles() {
		for (const role of this.doc.roles.general) if (role) this.rolesToAdd.add(role);
	}

	removeRegionRoles() {
		for (const region of this.doc.roles.regionroles.map(r => r.role)) if (!this.rolesToAdd.has(region.role)) this.rolesToRemove.add(region.role);
	}

	addMemberRoles() {
		for (const role of this.doc.roles.member) if (role) this.rolesToAdd.add(role);
	}

	removeMemberRoles() {
		for (const role of this.doc.roles.member) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

	addEventsRole() {
		for (const role of this.doc.roles.events) if (role) this.rolesToAdd.add(role);
	}

	addGuestRoles() {
		for (const role of this.doc.roles.guest) if (role) this.rolesToAdd.add(role);
	}

	removeGuestRoles() {
		for (const role of this.doc.roles.guest) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

	addRelicsMemberRoles() {
		for (const role of this.doc.roles.relicsmember) if (role) this.rolesToAdd.add(role);
	}

	removeRelicsMemberRoles() {
		for (const role of this.doc.roles.relicsmember) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

	removeVPRoles() {
		for (const role of this.doc.roles.vp) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

	addVPRoles() {
		for (const role of this.doc.roles.vp) if (role) this.rolesToAdd.add(role);
	}

	addSeniorRoles() {
		for (const role of this.doc.roles.senior) if (role) this.rolesToAdd.add(role);
	}

	removeSeniorRoles() {
		for (const role of this.doc.roles.senior) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

	removeSubregionRoles() {
		for (const role of this.doc.roles.subregionroles.map(r => r.role)) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

	removeClubRoles() {
		for (const role of this.doc.clubs.map(r => r.role)) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

	addVBPRoles() {
		for (const role of this.doc.roles.vbp) if (role) this.rolesToAdd.add(role);
	}

	removeVBPRoles() {
		for (const role of this.doc.roles.vbp) if (!this.rolesToAdd.has(role)) this.rolesToRemove.add(role);
	}

}

module.exports = RolesHandler;