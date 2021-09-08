const Component = require('../../Modules/Component/Component');
class ClubsManager extends Component {
	constructor() {
		super('clubManager');
	}

	get statusVerifier() { return this.client.componentHandler.getModule('statusVerifier'); }
	get settingsHandler() { return this.client.componentHandler.getModule('settingsHandler'); }

	async exec(msg, doc, changeType, value, role, subregion) {
		if (!(value.status === 200)) {return this.statusVerifier.exec(msg.channel, value.status, msg.author, this.value.tag, 'clubs');}
		switch (changeType) {
		case 'add': {
			const club = doc.clubs.find(guild => guild.tag === value.tag);
			if (club) return msg.reply({ content: 'This already exist in the list' });
			const clubExist = this.client.clubs.items.find(server => (server.type === 'HUB') && doc.clubs.find(c => c.tag === value.tag));
			if (clubExist) return msg.reply({ content: `This club is already registered in the hub server ${this.client.guilds.cache.get(clubExist.id).name}` });
			doc.clubs.push({ tag: value.tag, role: role.id, subregion: subregion });
			await this.settingsHandler.addClub(value.tag, 'clubs');
			await this.settingsHandler.addClub(value.tag, 'globalClubs');
			this.settingsHandler.sendLogs(`${msg.author.tag} added the club ${value.name} - ${value.tag} to clubs in ${msg.guild.name}`);
			return this.settingsHandler.exit(doc, msg, 'clubs', { at: Date.now(), by: msg.author.id, change: `Added club to clubs key, ${value.tag}.` });
		}
		case 'set': return msg.reply({ content: 'Please use add/remove change type to manage clubs' });
		case 'remove': {
			const club = doc.clubs.find(guild => guild.tag === value.tag);
			if (!club) return msg.reply({ content: 'This club doesn\'t exist in the list.' });
			if (doc.club.tag === value.tag) return msg.reply({ content: 'You cannot remove main club.' });
			doc.clubs.splice(doc.clubs.indexOf(club), 1);
			const clubDoc = this.client.clubs.items.find(item => item.tag === value.tag);
			await clubDoc.remove();
			this.client.clubs.items.delete(value.tag);
			await this.settingsHandler.removeClub(club.tag, 'clubs');
			await this.settingsHandler.removeClub(club.tag, 'globalClubs');
			this.settingsHandler.sendLogs(`${msg.author.tag} removed the club ${value.name} - ${value.tag} from clubs in ${msg.guild.name}`);
			return this.settingsHandler.exit(doc, msg, 'clubs', { at: Date.now(), by: msg.author.id, change: `Removed club from clubs key, ${value.tag}.` });
		}
		}
	}
}
module.exports = ClubsManager;