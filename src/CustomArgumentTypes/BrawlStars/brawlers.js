const fetch = require('node-fetch');

const Battlelog = (client) => async () => {
	try {
		const baseURL = client.baseURL(client);
		// const baseURL = client.baseURL;
		const response = await fetch(`${baseURL}/brawlers`, {
			method: 'GET',
			headers: {
				'content-Type': 'application/json',
				'authorization': `Bearer ${process.env.KEY1}`,
			},
		});
		if (!response) return { status: 101 };
		const status = response.status;
		if (!(status === 200)) return { status };
		const brawlers = await response.json();
		brawlers.status = status;
		return brawlers;
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = Battlelog;