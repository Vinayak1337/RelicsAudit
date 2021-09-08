const Request = require('../Modules/Request/Request');
const wait = require('util').promisify(setTimeout);

class ClubRequestHandler extends Request {
	constructor() {
		super('clubRequestHandler');
		this.clubsData = {};
		this.isBrawlerReq = false;
		this.eventStarted = false;
		this.waited = false;
		this.toSendClub = false;
		this.brawlerControl = {
			maxAge: 0,
			brawlers: null,
			startedAt: 0,
		};
	}

	get queue() { return this.client.requestHandler.getModule('queueHandler'); }

	get token() {
		return process.env.KEY2;
	}

	get baseurl() {
		return this.client.baseURL(this.client);
	}

	async handle(req) {
		const tag = await this.queue.getTag();
		try {
			if (tag === 'brawlers') {
				this.reqBrawlers(req);
			}
			else {await this.execute(tag, req);}
		}
		finally {
			if (!this.isBrawlerReq && this.toSendClub) this.client.emit('handleClub', this.clubsData[tag]);
			if (!this.eventStarted) {
				this.eventStarted = true;
				this.client.on('nextReq', () => {
					this.handle(req);
				});
			}
			if (this.isBrawlerReq) {
				this.isBrawlerReq = false;
				this.client.emit('nextReq');
			}
		}
	}

	async execute(tag, req) {
		let res;

		this.toSendClub = false;
		const startTime = Date.now();
		const requestingClub = this.clubsData[tag];

		const age = (startTime - requestingClub.startedAt) - (requestingClub.maxAge * 1000);
		if (age < 0) return;
		try {
			res = await req.make(tag, this.baseurl, this.token);
		}
		catch (error) {
			console.log(error);
		}

		const cache = res.headers.get('cache-control');
		const ttl = cache && cache.startsWith('max-age=') ? parseInt(cache.slice(8)) : 0;

		const clubControl = {
			startedAt: Date.now(),
			club: null,
			maxAge: ttl,
		};

		const status = res.status;

		switch (status) {

		case 200: {
			const club = await this.parseJson(res);
			clubControl.club = club;
			this.toSendClub = true;
		} break;

		case 400: console.log('Client provided incorrect parameters for the request.\n', status, '\nincorrect parameters\n', tag); break;

		case 403: console.log('Access denied, either because of missing/incorrect credentials or used API token does not grant access to the requested resource.\n', status, '\nincorrect credentials\n', tag); break;

		case 404: console.log('Resource was not found.\n', status, '\nNot found\n', tag); break;

		case 429: console.log('Request was throttled, because amount of requests was above the threshold defined for the used API token.\n', status, '\nToo many requests\n', tag); break;

		case 500: {
			console.log('Unknown error happened when handling the request.\n', status, '\nUnknown error\n', tag);
			this.execute(tag, req);
			break;
		}
		case 503: {
			if (this.waited) {
				this.waited = !this.waited;
				await wait(3.6e+6);
			}
			else {
				this.waited = !this.waited;
				await wait(1.8e+6);
			}
			return this.execute(tag, req);
		}
		}

		this.clubsData[tag] = clubControl;
	}

	async parseJson(res) {
		try {
			return await res.json();
		}
		catch (error) {
			console.log(error.message);
			return null;
		}
	}

	async reqBrawlers(req) {
		this.isBrawlerReq = true;
		const startTime = Date.now();

		const age = (startTime - this.brawlerControl.startedAt) - (this.brawlerControl.maxAge * 1000);
		if (age < 0) return;
		let res;
		try {
			res = await req.getBrawlers(this.token, this.baseurl);
			if (res.status === 200) {
				const json = await res.json();
				this.client.brawlers = {
					items: json.items,
					size: json.items.length,
				};
			}
		}
		catch (error) {
			console.log(req.status, '-----', error);
		}
	}
}

module.exports = ClubRequestHandler;