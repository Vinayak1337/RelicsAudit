const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class SettingsCommand extends Command {
	constructor() {
		super('settings', {
			aliases: ['settings'],
			category: 'verification',
			description: 'Customize server settings.',
			channel: 'guild',
		});
	}

	get settingsHandler() { return this.client.componentHandler.getModule('settingsHandler'); }
	get clubsManager() { return this.client.componentHandler.getModule('clubsManager'); }
	get feedersManager() { return this.client.componentHandler.getModule('feedersManager'); }
	get subRegionsManager() { return this.client.componentHandler.getModule('subRegionsManager'); }

	async userPermissions(msg) {
		const verified = this.client.clubs.verified.includes(msg.guild.id);
		if (!verified) return 'Server is not verified';
		else if (!(await this.client.clubs.isManager(msg.guild.id, msg.author.id) || this.client.isOwner(msg.author.id))) return 'You ain\'t a manager';
		return null;
	}

	async *args(msg) {
		const prefix = await this.handler.prefix(msg);
		const changeType = yield {
			type: (_msg, phrase) => {
				if (!phrase) return null;
				if (['add', 'set', 'remove'].some(value => value === phrase.toLowerCase())) return phrase.toLowerCase();
				return null;
			},
			prompt: {
				start: `**settings command**\n-> ${prefix}settings \`[add/remove/set]\` [key]\n-> \`add\` - To add something in the list.\n-> \`remove\` - To remove something from the list.\n-> \`set\` - To set an value or multiple values. (Override to the existing values)\n-> \`key\` - To get all keys go to https://justpaste.it/audit_settings_keys`,
				retry: 'Not a valid change type, please try again.',
			},
		};
		function isArray(value) {
			return Array.isArray(value);
		}

		function send(msgToSend) {
			msg.reply({ embeds: [new MessageEmbed().setDescription(msgToSend)] });
			return null;
		}

		function useSet() {
			return send('Please use set to change this key, please cancel the command & try again or enter a different key.');
		}

		const doc = await this.client.clubs.getDocument(msg.guild.id);
		console.log('false');
		const key = yield {
			type: async (_msg, phrase) => {
				phrase = phrase.toLowerCase();
				const server = await this.client.clubs.getDocument(msg.guild.id);
				if (['id', 'tag', 'region', 'club', 'subregion', 'type', 'verified', 'logs', 'subregionroles', 'blacklist', 'channels', 'roles', 'members', 'messages', 'hubserver', 'regionroles'].includes(phrase) || ((doc.type === 'HUB') && phrase === 'feeders') || (!(doc.type === 'HUB') && phrase === 'clubs')) return send('The entered key is not valid, try again. Please go to https://justpaste.it/audit_settings_keys to know all available keys.');

				const obj = { key: phrase };
				function returnObj() {
					return obj;
				}

				let value = server.channels[phrase];
				if (value) {
					if ((typeof value === 'string') && !(changeType === 'set')) return useSet();
					obj.value = value;
					obj.type = isArray(value) ? 'channelsArray' : 'channel';
					obj.msg = isArray(value) ? `id(s) of the channel(s) to ${changeType}. Separate them with space.` : `id of the ${phrase} to set.`;
					return returnObj();
				}

				value = server.roles[phrase];
				if (value) {
					obj.value = value;
					obj.type = 'rolesArray';
					obj.msg = `id(s) of the role(s) to ${changeType}. Separate them with space.`;
					return returnObj();
				}

				value = server.members[phrase];
				if (value) {
					obj.value = value;
					obj.type = 'membersArray';
					obj.msg = `id(s) of the member(s) to ${changeType}. Separate them with space.`;
					return returnObj();
				}
				value = server.messages[phrase];
				if (value) {
					obj.value = value;
					obj.type = 'embedToString';
					obj.msg = `the [message id](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) to get [embed](https://b1naryth1ef.github.io/disco/bot_tutorial/message_embeds.html) data from or type \`default\` to set default ${obj.key}.\n\nIf you do not have any embed ready, go to any embed builder like [this one](https://discohook.org/) and send the embed in a channel then provide the [message id](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-).`;
					return returnObj();
				}

				value = server[phrase];
				if (value) {
					obj.value = value;
					if (typeof value === 'string') {
						if (phrase === 'invite') {
							obj.msg = 'invite url to set.';
							obj.type = 'url';
						}
						else if (phrase === 'separator') {
							obj.msg = 'separator to set, make sure its length must not be more than 3.',
							obj.type = 'separator';
						}
						else {
							obj.msg = 'prefix to set.';
							obj.type = 'string';
						}
					}
					else if (typeof value === 'object') {
						if (phrase === 'subregions') {
							obj.msg = 'sub region to change. Only one sub region is allowed to change at a time';
							obj.type = 'string';
						}
						else {
							if (changeType === 'set') return send('you cannot use set to add/remove club, please try again.');
							obj.msg = `club tag to ${changeType}. Only one club is allowed to change at a time.`;
							obj.type = 'club';
						}
					}
					return returnObj();
				}
				return null;
			},
			prompt: {
				start: `Please enter the key to ${changeType}. To know all the keys visit: https://justpaste.it/audit_settings_keys`,
			},
		};


		if ((changeType === 'remove') && (typeof key.value === 'object') && (key.value.length === 1)) {
			msg.reply({ content: `There is only one id in ${key.key} & it can't be empty, please use set change type instead. Command has been cancelled, try again.` });
			return { toCancel: true };
		}

		const value = await (yield {
			type: key.type,
			prompt: {
				start: `Please enter the ${key.msg}.`,
				retry: 'Not a valid value, please try again.',
			},
		});


		let role = msg.guild.roles.cache.find(r => r.name === (value.name ? value.name : value));

		if (!role) {
			role = yield (((key.key === 'subregions' || ((key.key === 'clubs'))) && (changeType === 'add')) ? {
				type: 'role',
				prompt: {
					start: `Please enter the role id of ${value.name ? value.name : value}.`,
					retry: 'Not a valid role, please try again.',
				},
			} : { default: null });
		}

		const subregion = yield (((key.key === 'clubs') && (changeType === 'add')) ? {
			type: async (_msg, phrase) => {
				phrase = phrase.toUpperCase();
				if (doc.subregions.includes(phrase)) return phrase;
				return null;
			},
			prompt: {
				start: `Please enter the sub region of the club ${value.name}`,
				return: 'This sub region is not registered in the settings, please register it first, try again.',
			},
		} : { default: null });

		return { changeType, key, value, toCancel: false, role, subregion, doc };
	}

	async exec(msg, args) {
		try {
			const { toCancel, key, value, changeType, role, subregion, doc } = args;
			if (toCancel) return;

			if ((changeType === 'remove') && (value.length === key.value.length)) return msg.reply({ content: `There are only ${value.length} values, you can't make it empty. Use set instead.` });

			switch (key.type.replace('sArray', '')) {

			case 'channel': return this.settingsHandler.TypeHandler(msg, doc, changeType, 'channels', key, value);

			case 'role': return this.settingsHandler.TypeHandler(msg, doc, changeType, 'roles', key, value);

			case 'member': return this.settingsHandler.TypeHandler(msg, doc, changeType, 'members', key, value);

			case 'url': {
				doc.invite = value.href;
				return this.settingsHandler.exit(doc, msg, 'invite', { at: Date.now(), by: msg.author.id, change: `Set new invite url to invite key, ${value.href}.` });
			}

			case 'club': {
				if (key.key === 'clubs') return this.clubsManager(msg, doc, changeType, value, role, subregion);
				else if (key.key === 'feeders') return this.feedersManager(msg, doc, changeType, value);
				return;
			}

			case 'separator': {
				doc.separator = value;
				return this.settingsHandler.exit(doc, msg, 'invite', { at: Date.now(), by: msg.author.id, change: `Set separator to ${value}` });
			}

			default: {
				if (key.key === 'subregions') {return this.subRegionsManager(msg, doc, changeType, value, role);}
				else if (key.key === 'prefix') {
					doc.prefix = value;
					return this.settingsHandler.exit(doc, msg, 'invite', { at: Date.now(), by: msg.author.id, change: `Set separator to ${value}` });
				}
				else {
					doc.messages[key.key] = value;
					return this.settingsHandler.exit(doc, msg, 'messages', { at: Date.now(), by: msg.author.id, change: `Set the message to ${key.key} key.`, message: value });
				}
			}
			}
		}
		catch (error) {
			console.log(error);
			return msg.reply({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription(`An error occurred: \n\`\`\`\n${error.message}\n\`\`\``)] });
		}
	}
}

module.exports = SettingsCommand;
