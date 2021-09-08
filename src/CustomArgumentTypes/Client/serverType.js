const ServerType = () => (_msg, pharse) => {
	try {
		if (!pharse) return null;
		pharse = pharse.toUpperCase();
		if (['HUB', 'CLUB', 'PARTNER'].some(type => pharse === type)) return pharse;
		return null;
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = ServerType;