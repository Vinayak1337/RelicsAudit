class NicknameHandler {
	constructor(member, nncpRoles) {
		this.member = member;
		this.nncpRoles = nncpRoles;
	}

	filterNick() {
		if (this.nncpRoles.some(r => this.member.roles.cache.has(r))) return { changeable: false };
		else if (!this.member.manageable) return { changeable: false, reason: 'Member is high in role hierarchy.\nPlease either put my highest role above him or give one role from nncp / vip roles.' };
		return { changeable: true };
	}

	getNick(playername, isRelicsMember, isServerMember, clubname, separator) {
		if (!clubname) clubname = 'Guest';
		let name = playername;
		if (isRelicsMember) name = `${name} ${separator || '❯'}${clubname.replace('Relics', '') || ' Relics'}`;
		else if (isServerMember) name = `${name} ${separator || '❯'}${clubname.startsWith('Relics') ? ` ${clubname.replace('Relics', '') || ' Relics'}` : ` ${clubname}`}`;
		else name = `${name} ${separator || '❯'} Guest`;
		return name;
	}

	async setNick(nickname) {
		try {
			await this.member.setNickname(nickname);
			return true;
		}
		catch (error) {
			console.log(error);
			return error.message;
		}
	}
}

module.exports = NicknameHandler;