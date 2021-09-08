const SettingsMessage = (client) => async (msg, phrase) => {
	if (!phrase) return null;
	else if (phrase.toLowerCase() === 'default') return phrase.toLowerCase();
	else if (!phrase.match(/^[0-9]+$/)) return null;
	const embedMsg = await client.commandHandler.resolver.type('message')(msg, phrase);
	if (!embedMsg?.embeds?.length) return null;
	return JSON.stringify({ content: embedMsg.content, embed: embedMsg.embeds[0], files: embedMsg.attachments.map(a => a.url) });
};

module.exports = SettingsMessage;