const RolesArray = (client) => (msg, pharse) => {
	try {
		if (!pharse) return null;
		const roleResolver = client.commandHandler.resolver.type('role');
		let roles = pharse.split(' ');
		roles = roles.map(role => {
			return roleResolver(msg, role.replace('_', ' '));
		});
		for (const role of roles) if (!role) return null;
		return roles.map(role => role.id);
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = RolesArray;