const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class RegisterCommand extends Command {
	constructor() {
		super('register', {
			aliases: ['register'],
			category: 'verification',
			description: 'Registers a server as hub/club/partner.',
			channel: 'guild',
			ratelimit: 1,
			cooldown: 5000,
			ownerOnly: true,
		});
	}
	get statusVerifier() { return this.client.componentHandler.getModule('statusVerifier'); }
	get settingsHandler() { return this.client.componentHandler.getModule('settingsHandler'); }

	async *args(msg) {
		const verified = await this.client.clubs.get(msg.guild.id, 'verified', false);
		const toRegister = yield (verified ? {
			type: (_msg, phrase) => {
				if (phrase.match(/^(yes|no)/i)) return phrase;
				return null;
			},
			prompt: {
				start: `This server is already registered as ${await this.client.clubs.get(msg.guild.id, 'type')}, do you want to re-register? enter yes or no to re-register.`,
				retry: 'Not a valid value, please try again.',
			},
		} : { default: false });

		if (toRegister === 'no') {
			msg.reply({ content: 'Command has been cancelled.' });
			return { toCancel: true };
		}

		const type = yield {
			type: 'serverType',
			prompt: {
				start: 'Please enter the server type, please choose one from HUB, CLUB or PARTNER.',
				retry: 'Not a valid type, please choose one from HUB, CLUB or PARTNER.',
			},
		};

		const club = yield {
			type: 'club',
			prompt: {
				start: `Please enter the club tag of this server's main club. ${type === 'HUB' ? '\nYou can add more clubs later.' : 'You can add your feeder clubs later.'}`,
				retry: 'Not a valid club, please try again.',
			},
		};

		if (!(club.status === 200)) {
			this.statusVerifier.exec(msg.channel, club.status, msg.author, 'clubs');
			return { toCancel: true };
		}

		const clubExists = await this.client.clubs.findOne({ tag: club.tag, verified: true });
		if (clubExists) {
			msg.reply({ content: `${club.name} is already registered as a main club of a ${clubExists.type} server ${this.client.guilds.cache.get(clubExists.id).name}. Command has been cancelled. try again.` });
			return { toCancel: true };
		}

		if (type === 'HUB') {
			const existInHub = await this.client.clubs.findOne({ 'clubs.tag': club.tag });
			if (existInHub) {
				msg.reply({ content: `${club.tag} is already registered in the HUB server ${this.client.guilds.cache.get(existInHub.id).name}. Command has been cancelled. try again.` });
				return { toCancel: true };
			}
		}

		const region = yield (type === 'CLUB' ? {
			type: async (_msg, phrase) => {
				if (!phrase) return null;
				const guildResolver = this.client.commandHandler.resolver.type('guild');
				const guild = guildResolver(msg, phrase);
				if (!guild) return null;
				const server = await this.client.clubs.findOne({ id: guild.id });
				if (!server?.type) return null;
				if (!(server.type === 'HUB')) {
					msg.reply({ content: `It's not a HUB server, its a ${server.type} server.` });
					return null;
				}
				if (!server.clubs.includes(server.clubs.find(g => g.tag === club.tag))) return null;
				return { id: guild.id, region: server.region };
			},
			prompt: {
				start: 'Please enter the server id of its hub server.',
				retry: 'Not a hub server or your club isn\'t registered in it, please try again.',
			},
		} : type === 'HUB' ? {
			type: 'region',
			prompt: {
				start: 'Please enter region of this server, please choose one from APAC, EMEA, NA or LATAM.',
				retry: 'Not a valid region, please choose one from APAC, EMEA, NA or LATAM.',
			},
		} : { default:  null });

		const subregions = yield (type === 'HUB' ? {
			type: 'stringToArray',
			prompt: {
				start: `Please enter the sub regions of ${region}, separate them with space.\nYou can customise it later.`,
				retry: 'Not a valid string, please try again',
			},
		} : { default: null });

		const subregion = yield (type === 'HUB' ? {
			type: (_msg, phrase) => {
				phrase = phrase.toUpperCase();
				if (subregions.includes(phrase)) return phrase;
				return null;
			},
			prompt: {
				start: `Please enter the sub region of ${club.name}, choose only from ${subregions.join(', ')}.`,
				retry: 'Not a valid region, please try again.',
			},
		} : type === 'CLUB' ? { default: (await this.client.clubs.findOne({ 'clubs.tag': club.tag })).clubs.find(c => c.tag === club.tag).subregion } : { default: null });


		const invite = yield {
			type: 'url',
			prompt: {
				start: 'Please enter the permanent invite link of this server.',
				retry: 'Not a valid invite link, please try again.',
			},
		};

		// ----------------- Channels -----------------
		const verification = yield {
			type: 'channelsArray',
			prompt: {
				start: 'Please enter the channel id(s) for verification channels, seprate them with space.',
				retry: 'Channel(s) are not valid, please enter the valid channel(s).',
				time: 300000,
			},
		};

		const embed = yield (!(type === 'PARTNER') ? {
			type: 'channel',
			prompt: {
				start: 'Please enter the channel id for clubs embed.',
				retry: 'Not a valid channel, please enter a valid channel.',
			},
		} : { default: null });

		const bandodger = yield {
			type: 'channel',
			prompt: {
				start: 'Please enter a channel for ban dodgers.',
				retry: 'Channel is not valid, please enter a valid channel.',
			},
		};

		const clublog = yield {
			type: 'channel',
			prompt: {
				start: 'Please enter a channel for club logs.',
				retry: 'Channel is not valid, please enter a valid channel.',
			},
		};

		const auditlog = yield {
			type: 'channel',
			prompt: {
				start: 'Please enter a channel for audit logs.',
				retry: 'Channel is not valid, please enter a valid channel.',
			},
		};

		const colorrole = yield {
			type: 'channel',
			prompt: {
				start: 'Please enter the channel of color roles.',
				retry: 'Channel is not valid, please enter a valid channel.',
			},
		};

		const selfassignablerole = yield {
			type: 'channel',
			prompt: {
				start: 'Please enter the channel of self assignable roles.',
				retry: 'Channel is not valid, please enter a valid channel.',
			},
		};

		// ----------------- Roles -----------------

		const clubRole = (type === 'HUB' ? yield {
			type: 'role',
			prompt: {
				start: `Please enter the role id for ${club.name}`,
				retry: 'Role is not valid, try again.',
			},
		} : { default: null });

		const regionroles = [];
		const subregionroles = [];
		if (type === 'HUB') {
			const regions = ['APAC', 'EMEA', 'NA', 'LATAM'];
			regions.splice(regions.indexOf(region), 1);
			for (const regionname of regions) {
				const regionrole = yield {
					type: 'role',
					prompt: {
						start: `Please enter the role id for region ${regionname}.`,
						retry: 'Role is not valid, please enter the valid role id.',
						time: 300000,
					},
				};
				regionroles.push({ id: regionname, role: regionrole.id });
			}
			for (const subregionname of subregions) {
				const regionrole = yield {
					type: 'role',
					prompt: {
						start: `Please enter the role id for sub region ${subregionname}.`,
						retry: 'Role is not valid, please enter the valid role id.',
						time: 300000,
					},
				};

				subregionroles.push({ id: subregionname, role: regionrole.id });
			}
		}

		const general = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the role id(s) which will be assigned to every verified user, seprate them with space.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		const member = yield (!(type === 'HUB') ?
			{
				type: 'rolesArray',
				prompt: {
					start: `Please enter the role id(s) which will be assigned to every member of your club ${club.name}, seprate them with space.`,
					retry: 'Role(s) are not valid, please enter the valid role(s)',
					time: 300000,
				},
			} : { default: null });

		const relicsmember = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the role id(s) which will be assigned to every member of any relics club, seprate them with space.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		const guest = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the role id(s) which will be assigned to every non relics club member, seprate them with space.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		const vbp = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the role id(s) which will be assigned to every non brawl stars users, seprate them with space.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		const nncp = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the premium role id(s). if assigned to someone his nickname won\'t be changed by the bot, seprate them with space.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		const vp = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the role id(s) which will be assigned to the vice president of the the club(s), seprate them with space.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		const senior = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the role id(s) which will be assigned to the senior of the the club(s), seprate them with space.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		const events = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the role id(s) for your events such as giveaways or tournaments. They will be assigned to everyone, seprate them with space.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		const unverified = yield {
			type: 'rolesArray',
			prompt: {
				start: 'Please enter the role id(s) which will be removed from users while verification.',
				retry: 'Role(s) are not valid, please enter the valid role(s).',
				time: 300000,
			},
		};

		// ----------------- Others -----------------

		const verificationteam = yield {
			type: 'membersArray',
			prompt: {
				start: 'Please enter the member id(s) of your server\'s verification team, seprate them with space.\nNote: Only these will be allowed to verify in the server, no matter if verifier is server owner or without roles.',
				retry: 'Member(s) are not valid, please enter the valid member(s), should be member of this server.',
				time: 300000,
			},
		};

		const noticemessage = yield {
			type: 'string',
			prompt: {
				start: 'Please enter the notice message which will asked if a non verified user uses `+verifyme` command. Type `default` for default message.',
				retry: 'Not a valid text, please try again.',
				time: 600000,
			},
		};

		const entrymessage = yield {
			type: 'string',
			prompt: {
				start: 'Please enter the notice message which will asked in the dm if someone enters the server. Type `default` for default message.',
				retry: 'Not a valid text, please try again.',
				time: 600000,
			},
		};

		const welcomemessage = yield {
			type: 'string',
			prompt: {
				start: 'Please enter the notice message which will sent in the dm after the user gets verified. Type `default` for default message.',
				retry: 'Not a valid text, please try again.',
				time: 600000,
			},
		};

		const managers = yield {
			type: 'membersArray',
			prompt: {
				start: 'Please enter the id of the members who will be managing the settings or registered setup for this server in the bot.',
				retry: 'Member(s) are not valid, please enter the valid member(s), should be member of this server.',
				time: 300000,
			},
		};

		return { type, toCancel: false, club, region, verified: true, subregion, subregions, invite,
			channels: { verification, bandodger: bandodger.id, embed: embed.id, clublog: clublog.id, auditlog: auditlog.id, colorrole: colorrole.id, selfassignablerole: selfassignablerole.id },
			roles: { clubRole, unverified, subregionroles, regionroles, general, member, relicsmember, guest, vbp, nncp, vp, senior, events },
			members: { verificationteam, managers },
			noticemessage, entrymessage, welcomemessage };
	}

	async exec(msg, args = {}) {
		const em = new MessageEmbed().setColor(this.client.yellow);
		try {
			if (args.toCancel) return;
			const msg2 = await msg.reply({ embeds: [em.setDescription('Setting up the server, please wait...')] });
			if (args.type === 'CLUB') {
				const hubData = args.region;
				args.region = hubData.region;
				args.hubserver = hubData.id;
				delete args.roles.regionroles;
				delete args.roles.subregionroles;
				delete args.subregions;
				args.feeders = [];
			}

			if (args.type === 'HUB') {
				delete args.subrregion;
				const club = args.club;
				delete args.roles.member;
				args.clubs = [{ tag: club.tag, role: args.roles.clubRole.id, subregion: args.subregion }];
			}

			if (args.type === 'PARTNER') {
				delete args.region;
				delete args.roles.regionroles;
				delete args.roles.subregionroles;
				delete args.subregion;
				delete args.subregions;
				delete args.channels.embed;
				args.feeders = [];
			}

			args.tag = args.club.tag;
			args.id = msg.guild.id;
			args.invite = args.invite.href;
			delete args.roles.clubRole;
			delete args.toCancel;
			delete args.club.status;

			const doc = await this.client.clubs.model.findOneAndUpdate({ tag: args.tag }, args);
			if (!doc) await (await new this.client.clubs.model({ id: msg.guild.id, tag: args.club.tag, ...args })).save();

			if (!(args.type === 'PARTNER')) await this.settingsHandler.addClub(args.club.tag, 'clubs');
			await this.settingsHandler.addClub(args.club.tag, 'globalClubs');

			this.client.clubs.verified.push(msg.guild.id);
			msg2.edit({ embeds: [em.setDescription('Setup has been completed successfully.').setColor(this.client.green)] });
		}
		catch (error) {
			console.log(error);
			return msg.reply(em.setDescription(`Error while saving setup:\n\`\`\`${error.message}\n\`\`\``).setColor(this.client.red));
		}
	}
}

module.exports = RegisterCommand;
