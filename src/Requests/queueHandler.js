const Request = require('../Modules/Request/Request');
const wait = require('util').promisify(setTimeout);

class QueueHandler extends Request {
	constructor() {
		super('queueHandler');
		this.clubs = [];
	}

	get filterTag() { return this.client.componentHandler.getModule('filterTag'); }

	async getTag() {
		const tag = this.clubs.shift();
		if (tag) return this.filterTag.exec(tag);
		return await this.setTag();
	}

	async setTag() {
		this.clubs = ['brawlers', ...this.client.globals.items.first().globalClubs];
		this.client.emit('updateEmbed');
		await wait(1000);
		return this.clubs.shift();
	}
}

module.exports = QueueHandler;