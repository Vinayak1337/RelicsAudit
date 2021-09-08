const { MessageEmbed } = require('discord.js');
const cron = require('node-cron');
const Component = require('../../Modules/Component/Component');

class LadderManager extends Component {
	constructor() {
		super('ladderManager');
	}

	async start() {
		this.logChannel = this.client.channels.cache.get('794962101708914758');
		cron.schedule('28 13 * * Monday', async () => {
			const globalDoc = await this.client.globals.first();
			if (!(globalDoc.settings.ladderWeek === 4)) {
				globalDoc.settings.ladderWeek += 1;
				globalDoc.markModified('settings');
				await globalDoc.save();
				this.client.globals.items.set(globalDoc.id, globalDoc.settings);
				return;
			}
			globalDoc.settings.ladderWeek = 1;
			globalDoc.markModified('settings');
			await globalDoc.save();
			try {
				const pres = '554708258724773889';
				const bod = '692613049043124304';
				const cl = '631837021283024906';
				const tr = '684304619265982535';

				const id = '328479586297839618';
				const guild = this.client.guilds.cache.get(id);
				const lrRole = guild.roles.cache.get('681889857140031505');
				const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }).slice(0, 10).replace(',', '').split('/');
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				const role = await guild.roles.create({ name: `LR-${months[time[0] - 1]}/${time[1]}/${time[2]}-Recipients`, position: lrRole.position - 1 });
				const players = await this.client.players.items.map(item => item);
				const eligiblePlayers = players.filter(player => {
					return player.ladder[id] && guild.members.cache.has(player.id?.toString() || '0');
				});
				const globals = (await this.client.globals.model.find({}))[0];
				globals.settings.eligiblePlayers = eligiblePlayers;
				globals.markModified('settings');
				await globals.save();
				eligiblePlayers.sort((a, b) => b.trophies - a.trophies);
				const clubs = this.client.clubs.items.find(club => club.id === id).clubs;

				const ind = eligiblePlayers.filter(player => {
					const playerClub = clubs.find(club => club.tag === player.club.tag);
					return playerClub?.subregion === 'INDIA';
				}).slice(0, 9);

				const pakOrBd = eligiblePlayers.filter(player => {
					const playerClub = clubs.find(club => club.tag === player.club.tag);
					return playerClub?.subregion === 'BANGLADESH' || playerClub?.subregion === 'PAKISTAN';
				}).slice(0, 4);

				for (const player of ind) {
					await guild.members.cache.get(player.id)?.roles.add(role.id);
				}

				for (const player of pakOrBd) {
					await guild.members.cache.get(player.id)?.roles.add(role.id);
				}

				const channel = await guild.channels.create(`lr-waitlist-${months[time[0] - 1]}-${time[1]}`, {
					parent: '684305182464671784',
					permissionOverwrites: [
						{
							id: guild.roles.everyone.id,
							deny: ['VIEW_CHANNEL'],
						},
						{
							id: role.id,
							allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
						},
						{
							id: pres,
							deny: ['SEND_MESSAGES'],
							allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
						},
						{
							id: cl,
							deny: ['SEND_MESSAGES'],
							allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
						},
						{
							id: bod,
							deny: ['SEND_MESSAGES'],
							allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
						},
						{
							id: tr,
							allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'MANAGE_CHANNELS'],
						},
					],
				});

				const embeds = [
					new MessageEmbed().setColor(this.client.blue).setTitle('Top 9 in INDIA').setDescription(`${ind.map((m, i) => {
						return `\`${i + 1})\` **[${m.name}](https://www.starlist.pro/stats/profile/${m.tag.slice(1)})** - 🏆 **${m.trophies}**`;
					}).join('\n')}`),
					new MessageEmbed().setColor(this.client.blue).setTitle('Top 4 in PAKISTAN/BANGLADESH').setDescription(`${pakOrBd.map((m, i) => {
						return `\`${i + 1})\` **[${m.name}](https://www.starlist.pro/stats/profile/${m.tag.slice(1)})** - 🏆 **${m.trophies}**`;
					}).join('\n')}`),
				];

				channel.send({
					content: `<@&${pres}><@&${cl}><@&${bod}><@&${tr}>${role.toString()}`,
					embeds,
				});

				guild.channels.cache.get('675393499033501706')?.send({
					content: guild.roles.everyone.toString(),
					embeds: [ new MessageEmbed().setAuthor(guild.name, guild.iconURL({ dynamic: true }))
						.setColor(this.client.blue)
						.setDescription(`\`\`\`yaml\nRelics Ladder Rewards - Season ${globalDoc.settings.relicsLadderSeason} - ${months[time[0] - 1]} ${time[1]}\n\`\`\`\n❯ For more information on how to be eligible, check out <#705914623043567687>.\n\n❯ If you'd like to help sponsor the org, and help us with our Ladder Rewards, check out <#739423620484300850> for details on how you can support Relics.\n\n❯ If you'd like to merge with us, check out <#678512642519990278>.\`\`\`yaml\nNote:\n\`\`\`\n❯ They will need to stay in their clubs till the following Monday in order to receive their rewards.\n\n\`\`\`yaml\nRecipients:\n\`\`\``), ...embeds ],
				});
				globalDoc.settings.relicsLadderSeason += 1;
				globalDoc.markModified('settings');
				await globalDoc.save();

				setTimeout(async () => {
					const members = this.client.clubs.items.map(c => c.club.members);
					for (const member of members) {
						const player = players.find(p => p.tag === member.tag);
						if (player && !player.ladder[id]) {
							player.ladder[id] = true;
							player.markModified('ladder');
							await player.save();
						}
					}
				}, 3e5);
			}
			catch (error) {
				console.log(error);
				this.logChannel.send({ content: `Error while managing LR\n\`\`\`js\n${error}\n\`\`\`` });
			}
		}, {
			scheduled: true,
			timezone: 'Asia/Kolkata',
		});
	}
}

module.exports = LadderManager;