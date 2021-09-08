const { MessageEmbed } = require('discord.js');
const Component = require('../../Modules/Component/Component');

class StatusVerifier extends Component {
	constructor() {
		super('statusVerifier');
	}

	exec(channel, status, author, tag, endpoint) {
		switch (status) {
		case 404:
			{
				sendMessage(`Did not find any ${endpoint.replace('s', '')} with tag ${tag}, please try again`);
			}
			break;
		case 503:
			{
				sendMessage('There is maintenance on brawl stars servers, please try again later.');
			}
			break;
		default:
			{
				if ([400, 403, 429].some(c => c === status)) {sendMessage(`Request was aborted from brawl stars server, please report this error to ${this.client.support} with code ${status}.`);}
				else {sendMessage(null);}
			}
			break;
		}

		function sendMessage(msg) {
			const embed = new MessageEmbed()
				.setAuthor(author.tag, author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setColor(this.client.red);
			embed.setDescription(msg ? msg : 'Something went wrong, please try again');
			return channel.send({ embeds: [embed] });
		}
		// if ([400, 403, 429].some(c => c === status)) {
		// 	return new ErrorManager(this.client, author, {
		// 		errorType: 'status',
		// 		msg: `Error while fetching tag ${tag} in ${channel.toString()} of endpoint ${endpoint}, status code ${status}`,
		// 	}).send();
		// }
	}

}
module.exports = StatusVerifier;