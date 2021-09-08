const MembersArray = (client) => (msg, pharse) => {
	try {
		if (!pharse) return null;
		const memberResolver = client.commandHandler.resolver.type('member');
		let members = pharse.split(' ');
		members = members.map(ch => {
			return memberResolver(msg, ch.replace('_', ' '));
		});
		for (const member of members) if (!member) return null;
		return members.map(member => member.id);
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = MembersArray;