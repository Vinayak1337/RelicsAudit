const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class Blacklist extends Command {
	constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'bl'],
			category: 'verification',
			description: 'Add or remove a user from the blacklist or get a list of blacklisted users',
			channel: 'guild',
			ownerOnly: false,
		});
	}

	userPermissions(msg) {
		const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
		if (!doc) return 'Not a verified guild';
		const roles = [...doc.roles.senior, '554708258724773889'].concat(doc.roles.vp);
		if (!(this.client.clubs.isManager(msg.guild.id, msg.author.id, doc) || this.client.isOwner(msg.author.id) || roles.some(r => msg.member.roles.cache.has(r)))) return 'You are not allowed.';
		return null;
	}

	*args() {
		const option = yield {
			type: (_msg, phrase) => {
				if (!phrase) return null;
				phrase = phrase.toLowerCase();
				if (!['add', 'remove', 'show'].some(value => value === phrase)) return null;
				return phrase;
			},
			prompt: {
				start: 'Usage:\n```yaml\n[p]blacklist [add|remove|show] [value]\nadd - To add someone to blacklist\nremove - To remove someone from blacklist\n^ Allowed for managers only ^\nshow - To get a list of blacklisted users in DB\n^ Allowed for managers, presidents & seniors ^\n\nvalue - Only if you\'re adding or removing a user\n```',
				retry: 'Not a valid input, please try again.',
			},
		};
		const player = yield (!(option === 'show') ? {
			type: 'player',
			prompt: {
				start: `Please enter the tag of the user you want to ${option} ${option === 'add' ? 'to' : 'from'} blacklist`,
				retry: 'Not a valid tag, please try again',
			},
		} : { default: null });
		return { option, player };
	}

	async exec(msg, args) {
		const filterTag = this.client.componentHandler.getModule('filterTag');
		switch (args.option) {
		case 'show': {
			const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
			if (!doc.blacklist.length) return msg.reply('Blacklist is empty.');
			const players = await this.client.players.items.map(item => item);
			const blacklisted = players.filter(p => doc.blacklist.includes(p.tag));
			if (!blacklisted.length) return msg.reply('Blacklist is empty');
			let int = 0;
			const pairedBlacklist = blacklisted.reduce((acc, blacklist) => {
				if (acc[int].length > 25) {
					int += 1;
					acc.push([blacklist]);
					return acc;
				}
				else {
					acc[int].push(blacklist);
					return acc;
				}
			}, [[]]);
			let blacklistNum = 0;
			for (const blacklists of pairedBlacklist) {
				const em = new MessageEmbed().setColor(this.client.red)
					.addFields(
						blacklists.map(blacklist => {
							blacklistNum += 1;
							return { name: '\u200B', value: `${blacklistNum} - ${blacklist.trophies} - [${blacklist.name}](https://brawlify.com/stats/profile/${filterTag.exec(blacklist.tag)}) - ${blacklist.tag}` };
						}),
					);
				msg.author.send({ embeds: [em] });
			}
			return msg.reply({ content: 'Check your DM' });
		}

		case 'add': {
			const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
			if (!(this.client.clubs.isManager(msg.guild.id, msg.author.id, doc))) return;
			if (doc.blacklist.includes(args.player.tag)) return msg.reply('Already exists in the blacklist.');
			doc.blacklist.push(args.player.tag);
			doc.markModified('blacklist');
			await doc.save();
			msg.reply({ embeds: [ new MessageEmbed().setColor(this.client.green).setDescription(`Successfully added ${args.player.name} to the blacklist.`) ] });
			const playerDoc = this.client.players.items.find(p => p.tag === args.player.tag);
			if (!playerDoc) {
				const newDoc = await new this.client.players.model({ tag: args.player.tag, name: args.player.name, trophies: args.player.trophies, player: args.player }).save();
				this.client.players.items.set(newDoc.tag, newDoc);
			}
			else if (!(playerDoc.name === args.player.name)) {
				playerDoc.lastnames.push(playerDoc.name);
			}
			playerDoc.club = args.player.club;
			playerDoc.name = args.player.name;
			playerDoc.trophies = args.player.trophies;
			playerDoc.player = args.player;
			await playerDoc.save();
			return;
		}

		case 'remove': {
			const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
			if (!(this.client.clubs.isManager(msg.guild.id, msg.author.id, doc))) return;
			if (!doc.blacklist.includes(args.player.tag)) return msg.reply('Provided user does not exists in the blacklist.');
			doc.blacklist.splice(doc.blacklist.indexOf(args.player.tag), 1);
			doc.markModified('blacklist');
			await doc.save();
			msg.reply({ embeds: [ new MessageEmbed().setColor(this.client.green).setDescription(`Successfully removed ${args.player.name} from the blacklist.`) ] });
			const playerDoc = this.client.players.items.find(p => p.tag === args.player.tag);
			if (!playerDoc) {
				const newDoc = await new this.client.players.model({ tag: args.player.tag, name: args.player.name, trophies: args.player.trophies, player: args.player }).save();
				this.client.players.items.set(newDoc.tag, newDoc);
			}
			else if (!(playerDoc.name === args.player.name)) {
				playerDoc.lastnames.push(playerDoc.name);
			}
			playerDoc.club = args.player.club;
			playerDoc.name = args.player.name;
			playerDoc.trophies = args.player.trophies;
			playerDoc.player = args.player;
			await playerDoc.save();
			return;
		}
		}
	}
}

module.exports = Blacklist;
