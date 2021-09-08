const fetch = require('node-fetch');
const Request = require('../Modules/Request/Request');

class ClubRequest extends Request {
	constructor() {
		super('clubRequest');
	}

	make(tag, baseurl, token) {
		const url = `${baseurl}/clubs/%23${tag}`;
		const method = 'GET';
		const headers = {
			'content-Type': 'application/json',
			'authorization': `Bearer ${token}`,
		};
		const options = { method, headers };
		return fetch(url, options);
	}

	getBrawlers(token, baseurl) {
		const url = `${baseurl}/brawlers`;
		const method = 'GET';
		const headers = {
			'content-Type': 'application/json',
			'authorization': `Bearer ${token}`,
		};
		const options = { method, headers };
		return fetch(url, options);
	}
}

module.exports = ClubRequest;
