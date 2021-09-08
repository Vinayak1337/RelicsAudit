const channelsArray = (client) => (msg, pharse) => {
	try {
		if (!pharse) return null;
		const channelResolver = client.commandHandler.resolver.type('channel');
		let channels = pharse.split(' ');
		channels = channels.map(ch => {
			return channelResolver(msg, ch.replace('_', ' '));
		});
		for (const channel of channels) if (!channel) return null;
		return channels.map(channel => channel.id);
	}
	catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = channelsArray;