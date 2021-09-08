const Component = require('../../Modules/Component/Component');

class SettingsHandler extends Component {
	constructor() {
		super('settingsHandler');
	}

	async exit(doc, msg, key, log) {
		doc.logs.push(log);
		doc.markModified(key);
		await doc.save();
		return msg.reply({ content: 'Successfully changed the value.' });
	}

	sendLogs(content) {
		const channel = this.client.channels.cache.get('777592016590078003');
		if (channel) channel.send({ content });
	}

	TypeHandler(msg, doc, changeType, type, key, value) {
		try {
			switch (changeType) {
			case 'add': {
				if (Array.isArray(key.value)) {
					for (const id of value) {
						if (!doc[type][key.key].includes(id)) doc[type][key.key].push(id);
					}
					console.log(doc[type][key.key]);
					return this.exit(doc, msg, type, { at: Date.now(), by: msg.author.id, change: `Added ${type.replace} to ${key.key} key, ${value.join(', ')}.` });
				}
				else {
					doc[type][key.key] = value.id;
					return this.exit(doc, msg, `${type}.${key.key}`, { at: Date.now(), by: msg.author.id, change: `Added ${type.replace('s', '')} to ${key.key} key, ${value.id}.` });
				}
			}
			case 'set': {
				if (Array.isArray(key.value)) {
					doc[type][key.key] = JSON.parse(JSON.stringify(value));
					return this.exit(doc, msg, type, { at: Date.now(), by: msg.author.id, change: `Set ${type} to ${key.key} key, ${value.join(', ')}.` });
				}
				else {
					doc[type][key.key] = value.id;
					return this.exit(doc, msg, type, { at: Date.now(), by: msg.author.id, change: `Set ${type.replace('s', '')} to ${key.key} key, ${value.id}.` });
				}
			}
			case 'remove': {
				for (const id of value) {
					if (doc[type][key.key].includes(id)) doc[type][key.key].splice(doc[type][key.key].indexOf(id), 1);
				}
				return this.exit(doc, msg, `${type}.${key.key}`, { at: Date.now(), by: msg.author.id, change: `Removed ${type} from ${key.key} key, ${value.join(', ')}` });
			}
			default:
				break;
			}
		}
		catch (error) {
			console.log(error);
			return msg.reply({ content: `An error occurred: \n\`\`\`\n${error.message}\n\`\`\`` });
		}
	}

	async addClub(tag, key) {
		const clientDoc = (await this.client.globals.model.find())[0];
		if (clientDoc.settings[key].includes(tag)) {return;}
		this.client.globals.items.first()[key].push(tag);
		clientDoc.settings[key].push(tag);
		await this.Save(clientDoc);
	}

	async removeClub(tag, key) {
		const clientDoc = (await this.client.globals.model.find())[0];
		if (!clientDoc.settings[key].includes(tag)) {return;}
		this.client.globals.items.first()[key].splice(clientDoc.settings[key].indexOf(tag), 1);
		clientDoc.settings[key].splice(clientDoc.settings[key].indexOf(tag), 1);
		await this.Save(clientDoc);
	}

	async Save(doc) {
		doc.markModified('settings');
		return await doc.save();
	}

}
module.exports = SettingsHandler;