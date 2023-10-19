const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const guildModel = require('./guildModel');
const clientModel = require('./clientModel');
const playersModel = require('./playersModel');
const { readdirSync } = require('fs');
const { join } = require('path');
const ClubProvider = require('../Providers/ClubProvider');
const ClientProvider = require('../Providers/ClientProvider');
const PlayerProvider = require('../Providers/PlayerProvider');
const VerificationManager = require('../VerificationManagers/VerificationManager');
const { MessageEmbed } = require('discord.js');
const ComponentHandler = require('../Modules/Component/ComponentHandler');
const LadderManager = require('../Components/Features/ladderManager');
const RequestHandler = require('../Modules/Request/RequestHandler');
const foldersPath = join(__dirname, '..', 'CustomArgumentTypes');

class AuditClient extends AkairoClient {
	constructor() {
		super({
			ownerID: ['359223782747144192'],
		}, {
			fetchAllMembers: true,
			presence: {
				status: 'online',
				activity: {
					name: 'Loading commands & events, please wait.',
					type: 'PLAYING',
				},
			},
			intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_INTEGRATIONS', 'GUILD_MESSAGES'],
		});

		this.clubs = new ClubProvider(guildModel);
		this.globals = new ClientProvider(clientModel);
		this.players = new PlayerProvider(playersModel);
		this.prefix = '+';
		this.blue = '#5865F2';
		this.green = '#57F287';
		this.red = '#ED4245';
		this.yellow = '#FEE75C';
		this.white = '#FFFFFF';
		this.black = '#23272A';
		this.image = 'https://images-ext-2.discordapp.net/external/4wSwUydbXKO8ooISbiIdxXqsm_QpKWu6Kwarv_dD18Q/https/images-ext-2.discordapp.net/external/h6ihmwlQc7GiEzMW9GFPpabEHM3CWPAaatOxzhGolcU/https/media.discordapp.net/attachments/612201812262649867/760335107394371624/divider1-1.gif';
		this.support = 'https://discord.gg/5bQxph9';
		this.profileImage = 'https://cdn.discordapp.com/attachments/518142276795629573/846677338955710474/Screenshot_2021-05-25-14-03-00-031_com.supercell.brawlstars.jpg';
		this.embedData = {};
		this.baseURL = (client) => {
			// return 'https://bsproxy.royaleapi.dev/v1';
			return client.globals.items.first().baseURL;
		};

		this.commandHandler = new CommandHandler(this, {
			directory: './src/commands',
			prefix: async (msg) => {
				// return ';;';
				if (!msg) return this.prefix;
				const id = msg.guild?.id || msg.id;
				return await this.clubs.get(id, 'prefix', this.prefix);
			},
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			blockBots: true,
			blockClient: true,
			fetchMembers: true,
			storeMessages: true,
			argumentDefaults: {
				prompt: {
					modifyStart: (_msg, text) => {
						return { embeds: [new MessageEmbed().setColor(this.yellow).setDescription(`${text}${!text.endsWith('.') ? !text.endsWith('?') ? '.' : '' : ''} Type cancel to cancel this command anytime.`)] };
					},
					modifyRetry: (_msg, text) => {
						if (text) return { embeds: [new MessageEmbed().setColor(this.red).setDescription(text)] };
						return null;
					},
					timeout: { embeds: [new MessageEmbed().setColor(this.red).setDescription('Time ran out, command has been cancelled.')] },
					ended: { embeds: [new MessageEmbed().setColor(this.red).setDescription('Too many retries, command has been cancelled.')] },
					cancel: { embeds: [new MessageEmbed().setColor(this.blue).setDescription('Command has been cancelled.')] },
					retries: 5,
					time: 300000,
				},
			},
		});

		this.ladderManager = new LadderManager(this);

		// ---------- Custom Argument types ----------
		const typeFolders = readdirSync(foldersPath);
		for (const folder of typeFolders) {
			const filePath = join(__dirname, '../CustomArgumentTypes/', folder);
			const typeFiles = readdirSync(filePath);
			for (const typeFile of typeFiles) {
				const type = require(`${filePath}/${typeFile}`);
				const typeName = typeFile.split('.').shift();
				this.commandHandler.resolver.addType(typeName, type(this));
			}
		}
		console.log('Loaded custom argument types.');

		let logged = false;
		this.setBrawlers = (brawlers) => {
			if (!logged) {
				logged = true;
				console.log('setting brawlers');
			}
			this.brawlers = brawlers;
			this.brawlers.size = this.brawlers.items.length;
		};

		// ---------- Handlers ---------
		this.listenerHandler = new ListenerHandler(this, {
			directory: './src/events',
		});

		this.componentHandler = new ComponentHandler(this, {
			directory: './src/Components',
		});

		this.requestHandler = new RequestHandler(this, {
			directory: './src/Requests',
		});

		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			client: this,
			listenerHandler: this.listenerHandler,
		});

		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.loadAll();
		this.commandHandler.loadAll();
		this.componentHandler.loadAll();
		this.requestHandler.loadAll();
	}

	async login(token) {
		await this.globals.init();

		console.time('Added clubs to cache');
		await this.clubs.init();
		console.timeEnd('Added clubs to cache');

		console.time('Added players to cache');
		await this.players.init();
		console.timeEnd('Added players to cache');

		await this.clubs.setVerified();
		this.verificationManager = new VerificationManager(this);
		return await super.login(token);
	}

}

exports.AuditClient = AuditClient;
