const fetch = require('node-fetch');

const Player = (client) => async (_msg, pharse) => {
	try {
		if (!pharse) return null;
		const tag = await client.componentHandler.getModule('filterTag').exec(pharse);
		if (!tag) return null;
		const baseURL = client.baseURL(client);
		// const baseURL = client.baseURL;
		const response = await fetch(`${baseURL}/players/%23${tag}`, {
			method: 'GET',
			headers: {
				'content-Type': 'application/json',
				'authorization': `Bearer ${process.env.KEY1}`,
			},
		});
		if (!response) return { status: 101, tag };
		const status = response.status;
		if (!(status === 200)) return { status, tag };
		const player = await response.json();
		player.status = status;
		return player;
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = Player;