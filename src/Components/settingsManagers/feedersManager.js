const Component = require('../../Modules/Component/Component');

class FeedersManager extends Component {
	constructor() {
		super('feedersManager');
	}

	get statusVerifier() { return this.client.componentHandler.getModule('statusVerifier'); }
	get settingsHandler() { return this.client.componentHandler.getModule('settingsHandler'); }

	async exec(msg, doc, changeType, value) {
		if (!(value.status === 200)) return this.statusVerifier.exec(msg.channel, value.status, msg.author, value.tag, 'clubs');
		switch (changeType) {

		case 'add': {
			if (doc.feeders.includes(value.tag)) {return msg.reply({ content: 'This already exist in the list' });}
			else if (doc.club.tag === value.tag) {return msg.reply({ content: 'You cannot add main club into feeders list' });}
			else {
				const clubExist = await this.client.clubs.findOne({ 'feeders.tag': value.tag });
				if (clubExist) return msg.reply({ content: `This club is already registered in the server ${this.client.guilds.cache.get(clubExist.id).name}` });
			}
			doc.feeders.push(value.tag);

			await this.settingsHandler.addClub(value.tag, 'globalClubs');
			this.settingsHandler.sendLogs(`${msg.author.tag} added the club ${value.name} - ${value.tag} to feeders in ${msg.guild.name}.`);
			return this.settingsHandler.exit(doc, msg, 'feeders', { at: Date.now(), by: msg.author.id, change: `Added club to feeders key, ${value.tag}.` });
		}

		case 'set': return msg.reply({ content: 'Please use add/remove change type to manage clubs' });

		case 'remove': {
			if (!doc.feeders.includes(value.tag)) return msg.reply({ content: 'This club doesn\'t exist in the list.' });
			doc.feeders.splice(doc.feeders.indexOf(value.tag), 1);

			if (!this.client.clubs.items.find(guild => (guild.type === 'HUB') && guild.clubs.find(c => c.tag === value.tag))) this.settingsHandler.removeClub(value.tag, 'globalClubs');
			this.settingsHandler.sendLogs(`${msg.author.tag} removed the club ${value.name} - ${value.tag} from feeders in ${msg.guild.name}.`);
			return this.settingsHandler.exit(doc, msg, 'feeders', { at: Date.now(), by: msg.author.id, change: `Removed club from clubs key, ${value.tag}.` });
		}
		}
	}
}

module.exports = FeedersManager;