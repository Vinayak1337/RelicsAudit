const { MessageEmbed } = require('discord.js');
const Component = require('../../Modules/Component/Component');

class MessageBuilder extends Component {
	constructor() {
		super('messageBuilder');
		this.regex = /\{user\}|\{usertag\}|\{username\}|\{prefix\}|\{blank\}|\{server\}|\{trophies\}/gi;
	}

	build(msg, type, user, guild, channel, doc, player) {
		this.msg = msg;
		this.user = user;
		this.type = type;
		this.guild = guild;
		this.channel = channel;
		this.doc = doc;
		this.player = player;
		this.prefix = doc.prefix;
		this.variables = {
			'{user}': this.user,
			'{server}': this.guild.name,
			'{username}': this.user.username,
			'{usertag}': this.user.tag,
			'{blank}': '\u200b',
			'{trophies}': this.player?.trophies,
			'{prefix}': this.prefix || this.client.prefix,
		};

		if (this.msg.toLowerCase() === 'default') return this.buildDefault();
		const msg2 = JSON.parse(this.msg);
		const em = msg.embed;
		this.filterEmbed(em);
		return { content: msg2.content, embed: em, files: msg.files };
	}

	filterEmbed(em) {
		try {
			if (typeof em === 'string') {
				return em.replace(this.regex, match => this.variables[match]);
			}
			else if (Array.isArray(em) && em.length) {
				for (const i in em) {
					typeof em[i] === 'string' ? em[i] = this.filterEmbed(em[i]) : this.filterEmbed(em[i]);
				}
			}
			else if (em && (typeof em === 'object') && !Array.isArray(em)) {
				for (const key of Object.keys(em)) {
					typeof em[key] === 'string' ? em[key] = this.filterEmbed(em[key]) : this.filterEmbed(em[key]);
				}
			}
		}
		catch (error) {
			console.log(typeof em, em, '---', error);
		}
	}

	buildDefault() {
		switch (this.type) {
		case 'noticemessage': return this.noticeManager();
		case 'welcomemessage': return this.welcomeManager();
		case 'entrymessage': return this.entryManager();
		}
	}

	noticeManager() {
		return { content: this.user.toString(), embed: new MessageEmbed()
			.setColor(this.client.yellow)
			.setDescription(`Regardless of whether you are in our clubs or not you need to send a screenshot of your profile like the one below to ${this.channel} in order to get access to the rest of the server. Then wait for a moderator to verify you. Note:- Do not ping any Mod or Admin for roles, or 1 week mute, no exceptions.`)
			.setImage(this.client.profileImage)
			.setThumbnail(this.guild.iconURL({ dynamic: true }))
			.setAuthor(this.guild.name)
			.setTimestamp(),
		files: [] };
	}

	entryManager() {
		return { content: this.user.toString(), embed: new MessageEmbed()
			.setColor(this.client.blue)
			.setDescription(`Hey ${this.user.toString()}, Please send screenshot of your profile like below in ${this.channel.toString()} in order to get verified & wait for a moderator to verify you.\n\nIn any case if you're not getting verified for so long, then join our [main server](https://discord.gg/TXvxyR9) to get verified then use \`${this.prefix}verifyme\` here to get verified.\nMake Sure not to ping anyone for verification.`)
			.setImage(this.client.profileImage)
			.setThumbnail(this.guild.iconURL({ dynamic: true }))
			.setAuthor(this.user.tag, this.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp(),
		files: [] };

	}

	welcomeManager() {
		return { content: this.user.toString(), embed: new MessageEmbed()
			.setColor(this.client.green)
			.setDescription(`Hey ${this.user.toString()}, Welcome to Relics. <a:qb_welcomes:659003796097073162>\n• You're now successfully verified in ${this.guild.name}.\n• Get your color roles from <#${this.doc.channels.colorrole}>.\n• You have been given events role, customize your roles from <#${this.doc.channels.selfassignablerole}>.`)
			.addFields([
				{ name: '\u200b', value: '<:relics:847183622650069056> [`Relics Global`](https://relics-global.carrd.co/ "Relics global network")', inline: true },
				{ name: '\u200b', value: '<:relics_bs:847201922192638012> [`Relics Brawl Stars`](https://relics-bs.carrd.co/ "Relics brawl stars network")', inline: true },
				{ name: '\u200b', value: '<:relics_website:847202733656113162> [`Relics Website`](https://relicsesports.com/ "Relics esports website")', inline: true },
			])
			.setThumbnail(this.guild.iconURL({ dynamic: true }))
			.setAuthor(this.user.tag, this.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp(),
		files: [] };
	}
}
module.exports = MessageBuilder;