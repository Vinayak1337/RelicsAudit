const Component = require('../../Modules/Component/Component');

class SubRegionsManager extends Component {
	constructor() {
		super('subRegionsManager');
	}

	get settingsHandler() { return this.client.componentHandler.getModule('settingsHandler'); }
	exec(msg, doc, changeType, value, role) {
		switch (changeType) {
		case 'add': {
			const subregion = value.toUpperCase();
			if (doc.subreions.includes(subregion)) return msg.reply({ content: `${subregion} already exist in the list` });
			doc.subregions.push(subregion);
			doc.roles.subregionroles.push({ id: subregion, role: role.id });
			this.settingsHandler.sendLogs(`${msg.author.tag} added a sub region ${subregion} to ${msg.guild.name}`);
			return this.settingsHandler.exit(doc, msg, 'subregions', { at: Date.now(), by: msg.author.id, change: `Added a subregion to subregions key, ${subregion}.` });
		}

		case 'set': return msg.reply({ content: 'You cannot use set to change sub regions.' });

		case 'remove': {
			const subregion = value.toUpperCase();
			if (!doc.subreions.includes(subregion)) return msg.reply({ content: `${subregion} doesn't exist in the list` });
			doc.subregions.splice(doc.subregions.indexOf(subregion), 1);
			doc.roles.subregionroles.splice(doc.roles.subregionroles.indexOf(doc.roles.subregionroles.find(region => region.id === subregion)), 1);
			this.settingsHandler.sendLogs(`${msg.author.tag} removed a sub region ${subregion} from ${msg.guild.name}`);
			return this.settingsHandler.exit(doc, msg, 'subregions', { at: Date.now(), by: msg.author.id, change: `Added a subregion to subregions key, ${subregion}.` });
		}
		}
	}
}

module.exports = SubRegionsManager;