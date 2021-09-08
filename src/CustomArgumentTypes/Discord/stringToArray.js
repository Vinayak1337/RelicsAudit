const StringToArray = () => (_msg, pharse) => {
	try {
		if (!pharse) return null;
		return pharse.toUpperCase().split(' ');
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = StringToArray;