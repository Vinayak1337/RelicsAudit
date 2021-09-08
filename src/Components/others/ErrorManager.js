const { MessageEmbed } = require('discord.js');
const Component = require('../../Modules/Component/Component');

class ErrorManager extends Component {
	constructor() {
		super('errorManager');
	}

	exec(author, options) {
		this.author = author || this.client.user;
		this.options = options;
		const embed = new MessageEmbed()
			.setTitle('Encountered an error')
			.setAuthor(this.author.tag, this.author.displayAvatarURL({ dynamic: true }))
			.setColor(this.client.red)
			.setTimestamp()
			.setDescription(this.options.msg);
		const ch = this.client.guilds.cache.get(this.options.errorType === 'status' ? '835104032418824212' : '760606144845709312');
		if (!ch) {return console.error('Error channels are deleted');}
		ch.send({ embeds: [embed] });
	}
}
module.exports = ErrorManager;