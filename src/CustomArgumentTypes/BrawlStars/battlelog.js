const fetch = require('node-fetch');

const Battlelog = (client) => async (_msg, pharse) => {
	try {

		if (!pharse) return null;
		const tag = await client.componentHandler.getModule('filterTag').exec(pharse);
		if (!tag) return null;
		const baseURL = client.baseURL(client);
		const response = await fetch(`${baseURL}/players/%23${tag}/battlelog`, {
			method: 'GET',
			headers: {
				'content-Type': 'application/json',
				'authorization': `Bearer ${process.env.KEY1}`,
			},
		});
		if (!response) return { status: 101, tag };
		const status = response.status;
		if (!(status === 200)) return { status, tag };
		const battlelog = await response.json();
		battlelog.status = status;
		return battlelog;
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = Battlelog;