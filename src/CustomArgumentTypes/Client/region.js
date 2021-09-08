const Region = () => (_msg, pharse) => {
	try {
		if (!pharse) return null;
		pharse = pharse.toUpperCase();
		if (['APAC', 'EMEA', 'NA', 'LATAM'].some(region => pharse === region)) return pharse;
		return null;
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = Region;