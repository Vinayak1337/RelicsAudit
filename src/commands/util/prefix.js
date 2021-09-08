const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { MessageEmbed } = require('discord.js');

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'util',
			description: 'Shows or sets the command prefix.',
			args: [{
				id: 'prefix',
				type: 'string',
				default: '',
			}],
			channel: 'guild',
		});
	}

	async exec(msg, args) {
		const em = new MessageEmbed().setColor(this.client.blue);
		const msgOptions = {};
		if(!args.prefix) {
			const prefix = await this.client.clubs.get(msg.guild.id, 'prefix', this.client.prefix);
			msgOptions.embeds = [em.setDescription(stripIndents`
            Prefix is \`${prefix}\`.
			`)];
			return msg.reply(msgOptions);
		}

		if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
			msgOptions.embeds = [em.setDescription('Only administrators may change the command prefix.').setColor(this.client.red)];
			return msg.reply(msgOptions);
		}

		if (!this.client.clubs.verified.includes(msg.guild.id)) {
			msgOptions.embeds = [em.setDescription('Only allowed for verified servers').setColor(this.client.red)];
			return msg.reply(msgOptions);
		}

		const lowercase = args.prefix.toLowerCase();
		const prefix = args.prefix;
		const oldPrefix = await this.client.clubs.get(msg.guild.id, 'prefix', this.client.prefix);

		if(lowercase === 'default') {
			await this.client.clubs.set(msg.guild.id, 'prefix', this.client.prefix);
			`${(oldPrefix != prefix) ? msgOptions.embeds = [em.setDescription(`Prefix has been changed from \`${oldPrefix}\` to \`${this.client.prefix}\`.`).setColor(this.client.green)] : msgOptions.embeds = [em.setDescription('The prefix is already default').setColor(this.client.red)]} `;
		}
		else {
			await this.client.clubs.set(msg.guild.id, 'prefix', prefix);
			`${(oldPrefix != prefix) ? msgOptions.embeds = [em.setDescription(`Prefix has been changed from \`${oldPrefix}\` to \`${prefix}\`.`).setColor(this.client.green)] : msgOptions.embeds = [em.setDescription(`The prefix is already ${prefix}`).setColor(this.client.red)]}`;
		}

		await msg.reply(msgOptions);
	}
}

module.exports = PrefixCommand;
