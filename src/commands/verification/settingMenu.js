const { Command } = require('discord-akairo');
// eslint-disable-next-line no-unused-vars
const { MessageEmbed, MessageActionRow, MessageSelectMenu, Message, MessageComponentInteraction, TextChannel } = require('discord.js');

class SettingsCommand extends Command {
	constructor() {
		super('settingsMenu', {
			aliases: ['settingsmenu'],
			category: 'verification',
			description: 'Customize server settings.',
			channel: 'guild',
		});
	}

	get filterTag() { return this.client.componentHandler.getModule('filterTag'); }
	get settingsHandler() { return this.client.componentHandler.getModule('settingsHandler'); }
	get clubsManager() { return this.client.componentHandler.getModule('clubsManager'); }
	get feedersManager() { return this.client.componentHandler.getModule('feedersManager'); }
	get subRegionsManager() { return this.client.componentHandler.getModule('subRegionsManager'); }

	async userPermissions(msg) {
		const verified = this.client.clubs.verified.includes(msg.guild.id);
		if (!verified) return 'Server is not verified';
		else if (!(await this.client.clubs.isManager(msg.guild.id, msg.author.id) || this.client.isOwner(msg.author.id))) return 'You ain\'t a manager';
		return null;
	}

	getMenu(customId = '404', minValues = 1, maxValues = 1, placeholder = 'Please choose one or more..', options = [{
		label: 'Error',
		value: 'Something went wrong',
		description: 'Please try again, if it continues please report it',
		emoji: '❗',
		default: true,
	}]) {
		const menu = new MessageActionRow({
			components: [
				new MessageSelectMenu({
					customId, minValues, maxValues, placeholder, options,
				}),
			],
		});
		return menu;
	}

	/**
     * @param {Message} msg
     */
	async exec(msg) {
		const em = new MessageEmbed({
			color: this.client?.yellow,
			description: 'Please choose one of the options below.\nEvery asked question will wait for 2 minutes for you to choose. If you fail to choose within 2 minutes, the command will be cancelled.',
		});

		const menu1Options = [{
			label: 'Roles',
			value: 'option-roles',
			description: 'Edit the roles which are used for verification.',
		}, {
			label: 'Channels',
			value: 'option-channels',
			description: 'Edit the channels which are managed or used by me',
		}, {
			label: 'Members',
			value: 'option-members',
			description: 'Edit the members in manager or verification team',
		}, {
			label: 'Messages',
			value: 'option-messages',
			description: 'Edit entry, notice or welcome embed for new comers',
		}, {
			label: 'Others',
			value: 'option-others',
			description: 'Other options to edit or delete',
		}];
		const menu1 = this.getMenu('settings-option', 1, 1, 'Please choose what you want to manage.', menu1Options);

		let msgSent;
		try {
			msgSent = await msg.reply({ embeds: [em], components: [menu1] });
		}
		catch (err) {
			await msg.reply({ embeds: [em.setColor(this.client?.red).setDescription(`Error: \`\`\`js\n${err}\n\`\`\``)] });
		}
		const filter1 = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === 'settings-option';

		let interaction;
		try {
			interaction = await msgSent.awaitMessageComponent({ filter1, time: 2 * 60 * 1000 });
		}
		catch (error) {
			return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
		}

		switch(interaction.values[0]) {
		case 'option-roles': return this.handleRoles(em, msg, interaction, msgSent);
		case 'option-channels': return this.handleChannels(em, msg, interaction, msgSent);
		case 'option-members': return this.handleMembers(em, msg, interaction, msgSent);
		case 'option-messages': return this.handleMessages(em, msg, interaction, msgSent);
		case 'option-others': return this.handleOthers(em, msg, interaction, msgSent);
		}
	}

	/**
	 * @param {MessageEmbed} em
	 * @param {Message} msg
	 * @param {MessageComponentInteraction} interaction
	 * @param {Message} msgSent
	 */
	async handleRoles(em, msg, interaction, msgSent) {
		const roles = msg.guild.roles.cache.filter(r => r.editable && !r.managed && !r.deleted).map(r => r);
		const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
		const rolesTypeOptions = [{
			label: 'General Roles',
			description: 'Which will be given to every verified user.',
			value: 'general',
		}, {
			label: 'Unverified Roles',
			description: 'which will be given to unverified users.',
			value: 'unverified',
		}, {
			label: 'Club Member Roles',
			description: 'Which will be given to the club or feeder members.',
			value: 'member',
		}, {
			label: 'Relics Member Roles',
			description: 'Which will be given to every relics member.',
			value: 'relicsmember',
		}, {
			label: 'Guest Roles',
			description: 'Which will be given to Non Relics members.',
			value: 'guest',
		}, {
			label: 'Non Brawl Stars Roles',
			description: 'Which will be given to non brawl stars users.',
			value: 'vbp',
		}, {
			label: 'Nickname Changeable Roles',
			description: 'If assigned, their nicknames will not be changed.',
			value: 'nncp',
		}, {
			label: 'Notification Roles',
			description: 'Which will be assigned to new verified users.',
			value: 'events',
		}, {
			label: 'Vice President Roles',
			description: 'Which will be assigned to every Vice President.',
			value: 'vp',
		}, {
			label: 'Senior Roles',
			description: 'Which will be assigned to every Senior.',
			value: 'senior',
		}];

		if (doc.type === 'HUB') {
			rolesTypeOptions.splice(2, 0);
		}

		em.setColor(this.client.yellow).setDescription('Please select a role type to edit.');
		const rolesTypeMenu = this.getMenu('settings-roles-option', 1, 1, 'Please choose what role type you want to manage.', rolesTypeOptions);

		await interaction.update({ embeds: [em], components: [rolesTypeMenu] });
		const filter1 = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === 'settings-roles-option';
		try {
			interaction = await msgSent.awaitMessageComponent({ filter1, time: 2 * 60 * 1000 });
		}
		catch (error) {
			return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
		}

		const selectedOption = interaction.values[0];

		let int = 0;
		const rolesToChoose = roles.reduce((acc, role, index) => {
			if (!acc.length) {
				return [[{
					label: `${role.name}`.slice(0, 25),
					value: role.id,
					default: doc.roles[selectedOption].includes(role.id) ? true : false,
				}]];
			}
			else if (acc[int].length < 23) {
				acc[int].push(
					{
						label: `${role.name}`.slice(0, 25),
						value: role.id,
						default: doc.roles[selectedOption].includes(role.id) ? true : false,
					},
				);
				return acc;
			}
			else if ((acc[int].length === 23) && roles[index + 1]) {
				acc[int].push({
					label: 'Confirm',
					value: 'confirm-roles',
					description: 'To confirm the selected roles and make changes.',
				}, {
					label: 'Next Set of Roles',
					value: 'next-roles',
					description: 'Next Set of Roles to choose, it is irreversible',
				});
				int += 1;
				acc.push([{
					label: `${role.name}`.slice(0, 25),
					value: role.id,
					default: doc.roles[selectedOption].includes(role.id) ? true : false,
				}]);
				return acc;
			}
			else {
				acc[int].push(
					{
						label: `${role.name}`,
						value: role.id,
						default: doc.roles[selectedOption].includes(role.id) ? true : false,
					}, {
						label: 'Confirm Roles',
						value: 'confirm-roles',
						description: 'To confirm the selected roles and make changes.',
					},
				);
				return acc;
			}
		}, []);
		const values = new Set();

		const filter = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === `settings-roles-${selectedOption}`;
		em.setColor(this.client.yellow).setDescription('Please select or deselect roles(s) to make changes.');
		let toContinue = false;
		for (const group of rolesToChoose) {
			if (toContinue) continue;
			const rolesMenu = this.getMenu(`settings-roles-${selectedOption}`, 1, 15, 'Please select at least 1 or at most 15 roles.', group);
			await interaction.update({ embeds: [em], components: [rolesMenu] });
			try {
				interaction = await msgSent.awaitMessageComponent({ filter, time: 2 * 60 * 1000 });
			}
			catch (error) {
				toContinue = true;
				return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
			}
			if (!interaction.isSelectMenu()) continue;
			const chosenValues = interaction.values;
			if (chosenValues.includes('confirm-roles')) toContinue = true;
			if (!chosenValues.includes('next-roles')) toContinue = true;
			for (const value of chosenValues) {
				if (!(value === 'next-roles' || value === 'confirm-roles')) {
					values.add(value);
				}
			}
			continue;
		}

		if (!values.size) return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('It cannot be empty, command has been cancelled.')], components: [] });

		doc.roles[selectedOption] = [...values];
		doc.markModified('roles');
		await doc.save();
		await interaction.update({ embeds: [em.setColor(this.client.green).setDescription('Successfully changed the value.')], components: [] });
	}

	/**
	 * @param {MessageEmbed} em
	 * @param {Message} msg
	 * @param {MessageComponentInteraction} interaction
	 * @param {Message} msgSent
	 */
	async handleChannels(em, msg, interaction, msgSent) {
		const channels = msg.guild.channels.cache.filter(c => ((c.type === 'text') || (c.type === 'news')) && c.viewable && !c.deleted).map(c => c);
		const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
		const channelsTypeOptions = [{
			label: 'Verification Channels',
			description: 'Where people can be verified & switch roles.',
			value: 'verification',
		}, {
			label: 'Clubs Embed Channel',
			description: 'Where the official clubs stats will be sent.',
			value: 'embed',
		}, {
			label: 'Club Logs Channel',
			description: 'Where the logs of your club & feeder will be sent.',
			value: 'clublog',
		}, {
			label: 'Audit Log Channel',
			description: 'Where the errors will be sent while verification.',
			value: 'auditlog',
		}, {
			label: 'Color Role Channel',
			description: 'To build welcome/notice message for new comers.',
			value: 'colorrole',
		}, {
			label: 'Self Roles Channel',
			description: 'To build welcome/notice message for new comers.',
			value: 'selfassignablerole',
		}, {
			label: 'Ban Dodgers Channel',
			description: 'Notification will be sent when a threat enters.',
			value: 'bandodger',
		}];

		if (doc.type === 'PARTNER') channelsTypeOptions.splice(1, 0);

		em.setColor(this.client.yellow).setDescription('Please select a channel type to edit.');
		const channelsTypeMenu = this.getMenu('settings-channels-option', 1, 1, 'Please choose what channel type you want to manage.', channelsTypeOptions);

		await interaction.update({ embeds: [em], components: [channelsTypeMenu] });
		const filter1 = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === 'settings-channels-option';
		try {
			interaction = await msgSent.awaitMessageComponent({ filter1, time: 2 * 60 * 1000 });
		}
		catch (error) {
			return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
		}

		const selectedOption = interaction.values[0];

		let int = 0;
		const channelsToChoose = channels.reduce((acc, channel, index) => {
			if (!acc.length) {
				return [[{
					label: `${channel.name}`.slice(0, 25),
					value: channel.id,
					default: doc.channels[selectedOption].includes(channel.id) ? true : false,
				}]];
			}
			else if (acc[int].length < 23) {
				acc[int].push(
					{
						label: `${channel.name}`.slice(0, 25),
						value: channel.id,
						default: doc.channels[selectedOption].includes(channel.id) ? true : false,
					},
				);
				return acc;
			}
			else if ((acc[int].length === 23) && channels[index + 1]) {
				acc[int].push({
					label: 'Confirm Channels',
					value: 'confirm-channels',
					description: 'To confirm the selected channels and make changes.',
				}, {
					label: 'Next Set of channels',
					value: 'next-channels',
					description: 'Next Set of channels to choose, it is irreversible',
				});
				int += 1;
				acc.push([{
					label: `${channel.name}`.slice(0, 25),
					value: channel.id,
					default: doc.channels[selectedOption].includes(channel.id) ? true : false,
				}]);
				return acc;
			}
			else {
				acc[int].push(
					{
						label: `${channel.name}`,
						value: channel.id,
						default: doc.channels[selectedOption].includes(channel.id) ? true : false,
					}, {
						label: 'Confirm',
						value: 'confirm-channels',
						description: 'To confirm the selected channels and make changes.',
					},
				);
				return acc;
			}
		}, []);
		const values = new Set();

		const filter = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === `settings-channels-${selectedOption}`;
		em.setColor(this.client.yellow).setDescription('Please select or deselect channel(s) to make changes.');
		let toContinue = false;
		for (const group of channelsToChoose) {
			if (toContinue) continue;
			const maxValue = selectedOption === 'verification' ? 15 : 1;
			const rolesMenu = this.getMenu(`settings-channels-${selectedOption}`, 1, maxValue, 'Please select the channels to manage.', group);
			await interaction.update({ embeds: [em], components: [rolesMenu] });
			try {
				interaction = await msgSent.awaitMessageComponent({ filter, time: 2 * 60 * 1000 });
			}
			catch (error) {
				toContinue = true;
				return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
			}
			if (!interaction.isSelectMenu()) continue;
			const chosenValues = interaction.values;
			if (chosenValues.includes('confirm-channels')) toContinue = true;
			if (!chosenValues.includes('next-channels')) toContinue = true;
			for (const value of chosenValues) {
				if (!(value === 'next-channels' || value === 'confirm-channels')) {
					values.add(value);
				}
			}
			continue;
		}
		if (!values.size) return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('It cannot be empty, command has been cancelled.')], components: [] });

		doc.channels[selectedOption] = values.size > 1 ? [...values] : [...values][0];
		doc.markModified('channels');
		await doc.save();
		await interaction.update({ embeds: [em.setColor(this.client.green).setDescription('Successfully changed the value.')], components: [] });
	}

	/**
	 * @param {MessageEmbed} em
	 * @param {Message} msg
	 * @param {MessageComponentInteraction} interaction
	 * @param {Message} msgSent
	 */
	async handleMembers(em, msg, interaction, msgSent) {
		const members = msg.guild.members.cache.filter(m => !m.user.bot && !m.deleted && !m.pending && !m.user.system).map(m => m);
		const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
		const membersTypeOptions = [{
			label: 'Verification Team Members',
			description: 'Who can verify the new users.',
			value: 'verificationteam',
		}, {
			label: 'Managers',
			description: 'Who can have access to the all bot commands.',
			value: 'managers',
		}];

		em.setColor(this.client.yellow).setDescription('Please select a members type to edit.');
		const channelsTypeMenu = this.getMenu('settings-members-option', 1, 1, 'Please choose who you want to give access.', membersTypeOptions);

		await interaction.update({ embeds: [em], components: [channelsTypeMenu] });
		const filter1 = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === 'settings-members-option';
		try {
			interaction = await msgSent.awaitMessageComponent({ filter1, time: 2 * 60 * 1000 });
		}
		catch (error) {
			return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
		}

		const selectedOption = interaction.values[0];

		let int = 0;
		const membersToChoose = members.reduce((acc, member, index) => {
			if (!acc.length) {
				return [[{
					label: `${member.name}`.slice(0, 25),
					value: member.id,
					default: doc.channels[selectedOption].includes(member.id) ? true : false,
				}]];
			}
			else if (acc[int].length < 23) {
				acc[int].push(
					{
						label: `${member.name}`.slice(0, 25),
						value: member.id,
						default: doc.channels[selectedOption].includes(member.id) ? true : false,
					},
				);
				return acc;
			}
			else if ((acc[int].length === 23) && members[index + 1]) {
				acc[int].push({
					label: 'Confirm Members',
					value: 'confirm-members',
					description: 'To confirm the selected members and make changes.',
				}, {
					label: 'Next Set of Members',
					value: 'next-channels',
					description: 'Next Set of members to choose, it is irreversible',
				});
				int += 1;
				acc.push([{
					label: `${member.name}`.slice(0, 25),
					value: member.id,
					default: doc.channels[selectedOption].includes(member.id) ? true : false,
				}]);
				return acc;
			}
			else {
				acc[int].push(
					{
						label: `${member.name}`,
						value: member.id,
						default: doc.channels[selectedOption].includes(member.id) ? true : false,
					}, {
						label: 'Confirm',
						value: 'confirm-members',
						description: 'To confirm the selected members and make changes.',
					},
				);
				return acc;
			}
		}, []);
		const values = new Set();

		const filter = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === `settings-members-${selectedOption}`;
		em.setColor(this.client.yellow).setDescription('Please select or deselect member(s) to make changes.');
		let toContinue = false;
		for (const group of membersToChoose) {
			if (toContinue) continue;
			const maxValue = selectedOption === 'verification' ? 15 : 1;
			const rolesMenu = this.getMenu(`settings-members-${selectedOption}`, 1, maxValue, 'Please select the members to manage.', group);
			await interaction.update({ embeds: [em], components: [rolesMenu] });
			try {
				interaction = await msgSent.awaitMessageComponent({ filter, time: 2 * 60 * 1000 });
			}
			catch (error) {
				toContinue = true;
				return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
			}
			if (!interaction.isSelectMenu()) continue;
			const chosenValues = interaction.values;
			if (chosenValues.includes('confirm-members')) toContinue = true;
			if (!chosenValues.includes('next-members')) toContinue = true;
			for (const value of chosenValues) {
				if (!(value === 'next-members' || value === 'confirm-members')) {
					values.add(value);
				}
			}
			continue;
		}
		if (!values.size) return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('It cannot be empty, command has been cancelled.')], components: [] });

		doc.channels[selectedOption] = values.size > 1 ? [...values] : [...values][0];
		doc.markModified('members');
		await doc.save();
		await interaction.update({ embeds: [em.setColor(this.client.green).setDescription('Successfully changed the value.')], components: [] });
	}

	/**
	 * @param {MessageEmbed} em
	 * @param {Message} msg
	 * @param {MessageComponentInteraction} interaction
	 * @param {Message} msgSent
	 */
	async handleMessages(em, msg, interaction, msgSent) {
		return interaction.update({ content: 'Its not ready yet.', components: [] });
		const members = msg.guild.members.cache.filter(m => !m.user.bot && !m.deleted && !m.pending && !m.user.system).map(m => m);
		const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
		const membersTypeOptions = [{
			label: 'Verification Team Members',
			description: 'Who can verify the new users.',
			value: 'verificationteam',
		}, {
			label: 'Managers',
			description: 'Who can have access to the all bot commands.',
			value: 'managers',
		}];

		em.setColor(this.client.yellow).setDescription('Please select a members type to edit.');
		const channelsTypeMenu = this.getMenu('settings-members-option', 1, 1, 'Please choose who you want to give access.', membersTypeOptions);

		await interaction.update({ embeds: [em], components: [channelsTypeMenu] });
		const filter1 = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === 'settings-members-option';
		try {
			interaction = await msgSent.awaitMessageComponent({ filter1, time: 2 * 60 * 1000 });
		}
		catch (error) {
			return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
		}

		const selectedOption = interaction.values[0];

		let int = 0;
		const membersToChoose = members.reduce((acc, member, index) => {
			if (!acc.length) {
				return [[{
					label: `${member.name}`.slice(0, 25),
					value: member.id,
					default: doc.channels[selectedOption].includes(member.id) ? true : false,
				}]];
			}
			else if (acc[int].length < 23) {
				acc[int].push(
					{
						label: `${member.name}`.slice(0, 25),
						value: member.id,
						default: doc.channels[selectedOption].includes(member.id) ? true : false,
					},
				);
				return acc;
			}
			else if ((acc[int].length === 23) && members[index + 1]) {
				acc[int].push({
					label: 'Confirm Members',
					value: 'confirm-members',
					description: 'To confirm the selected members and make changes.',
				}, {
					label: 'Next Set of Members',
					value: 'next-channels',
					description: 'Next Set of members to choose, it is irreversible',
				});
				int += 1;
				acc.push([{
					label: `${member.name}`.slice(0, 25),
					value: member.id,
					default: doc.channels[selectedOption].includes(member.id) ? true : false,
				}]);
				return acc;
			}
			else {
				acc[int].push(
					{
						label: `${member.name}`,
						value: member.id,
						default: doc.channels[selectedOption].includes(member.id) ? true : false,
					}, {
						label: 'Confirm',
						value: 'confirm-members',
						description: 'To confirm the selected members and make changes.',
					},
				);
				return acc;
			}
		}, []);
		const values = new Set();

		const filter = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === `settings-members-${selectedOption}`;
		em.setColor(this.client.yellow).setDescription('Please select or deselect member(s) to make changes.');
		let toContinue = false;
		for (const group of membersToChoose) {
			if (toContinue) continue;
			const maxValue = selectedOption === 'verification' ? 15 : 1;
			const rolesMenu = this.getMenu(`settings-members-${selectedOption}`, 1, maxValue, 'Please select the members to manage.', group);
			await interaction.update({ embeds: [em], components: [rolesMenu] });
			try {
				interaction = await msgSent.awaitMessageComponent({ filter, time: 2 * 60 * 1000 });
			}
			catch (error) {
				toContinue = true;
				return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
			}
			if (!interaction.isSelectMenu()) continue;
			const chosenValues = interaction.values;
			if (chosenValues.includes('confirm-members')) toContinue = true;
			if (!chosenValues.includes('next-members')) toContinue = true;
			for (const value of chosenValues) {
				if (!(value === 'next-members' || value === 'confirm-members')) {
					values.add(value);
				}
			}
			continue;
		}
		if (!values.size) return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('It cannot be empty, command has been cancelled.')], components: [] });

		doc.channels[selectedOption] = values.size > 1 ? [...values] : [...values][0];
		doc.markModified('members');
		await doc.save();
		await interaction.update({ embeds: [em.setColor(this.client.green).setDescription('Successfully changed the value.')], components: [] });
	}

	/**
	 * @param {MessageEmbed} em
	 * @param {Message} msg
	 * @param {MessageComponentInteraction} interaction
	 * @param {Message} msgSent
	 */
	async handleOthers(em, msg, interaction, msgSent) {
		const doc = this.client.clubs.items.find(item => item.id === msg.guild.id);
		const othersTypeOptions = [{
			label: 'Clubs',
			description: 'Manage official clubs for your HUB.',
			value: 'clubs',
		}, {
			label: 'Sub Regions',
			description: 'Manage sub regions for your HUB.',
			value: 'subregions',
		}, {
			label: 'Feeders',
			description: 'Manage feeder clubs for your server.',
			value: 'feeders',
		}, {
			label: 'Permanent Invite Link',
			description: 'Change permanent invite link of your server',
			value: 'invite',
		}, {
			label: 'Nickname separator',
			description: 'Change nickname separator of your server',
			value: 'separator',
		}, {
			label: 'Command Prefix',
			description: 'Change command prefix of your server',
			value: 'prefix',
		}];

		if (doc.type === 'HUB') othersTypeOptions.splice(2, 1);
		if (!(doc.type === 'HUB')) othersTypeOptions.splice(0, 2);

		em.setColor(this.client.yellow).setDescription('Please select a members type to edit.');
		const othersTypeMenu = this.getMenu('settings-members-option', 1, 1, 'Please choose who you want to manage.', othersTypeOptions);

		await interaction.update({ embeds: [em], components: [othersTypeMenu] });
		const filter1 = (i) => (i.user.id === msg.author.id) && i.isSelectMenu() && i.customId === 'settings-others-option';
		try {
			interaction = await msgSent.awaitMessageComponent({ filter1, time: 2 * 60 * 1000 });
		}
		catch (error) {
			return msgSent.edit({ embeds: [em.setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
		}

		const selectedOption = interaction.values[0];
		await interaction.update({ embeds: [em.setColor(this.client.green).setDescription('Proceeding please wait...')], components: [] });

		switch (selectedOption) {
		case 'invite': {
			const start = new MessageEmbed().setColor(this.client.yellow).setDescription(`The current permanent invite URL is ${doc.invite}.\nPlease enter a URL to change the current permanent invite URL.\nOr type \`cancel\` to cancel the command.`);
			const retry = new MessageEmbed().setColor(this.client.red).setDescription('Not a valid URL, please try again.');
			const urlFn = this.client.commandHandler.resolver.type('url');
			const invite = await this.prompt(msg, urlFn, start, retry);
			if (!invite) return;
			doc.invite = invite.href;
			doc.save();
			return await msgSent.edit({ embeds: [em.setColor(this.client.green).setDescription('Successfully changed the value.')], components: [] });
		}

		case 'separator': {
			const start = new MessageEmbed().setColor(this.client.yellow).setDescription(`The current nickname separator is ${doc.separator}.\nPlease enter a new separator to change current separator.\nOr type \`cancel\` to cancel the command.`);
			const retry = new MessageEmbed().setColor(this.client.red).setDescription('Not a valid separator, it must not be more than 3 characters long, please try again.');
			const sepFn = (_msg2, phrase) => {
				if (!phrase) return null;
				if (phrase.length > 3) return null;
				return phrase.toLowerCase();
			};
			const separator = await this.prompt(msg, sepFn, start, retry);
			if (!separator) return;
			doc.separator = separator;
			await doc.save();
			return await msgSent.edit({ embeds: [em.setColor(this.client.green).setDescription('Successfully changed the value.')], components: [] });
		}

		case 'prefix': {
			const start = new MessageEmbed().setColor(this.client.yellow).setDescription(`The current command prefix is ${doc.prefix}.\nPlease enter a new prefix to change current prefix.\nOr type \`cancel\` to cancel the command.`);
			const retry = new MessageEmbed().setColor(this.client.red).setDescription('Not a valid prefix, it must not be more than 3 characters long, please try again.');
			const sepFn = (_msg2, phrase) => {
				if (!phrase) return null;
				if (phrase.length > 3) return null;
				return phrase.toLowerCase();
			};
			const prefix = await this.prompt(msg, sepFn, start, retry);
			if (!prefix) return;
			doc.prefix = prefix;
			await doc.save();
			return await msgSent.edit({ embeds: [em.setColor(this.client.green).setDescription('Successfully changed the value.')], components: [] });
		}

		case 'clubs': {
			const start = new MessageEmbed().setColor(this.client.yellow).setDescription(`The current clubs are\n${doc.clubs.map(c => `**${c.tag}** - <@&${c.role}> - \`${c.subregion}\``).join(', ')}.`).addField('\u000b', 'Please enter change type, club tag, role & subregion of club (if adding club)\nchnage type - add or remove\n. e.g:\n`add #8CYRL 694300259392929 INDIA` or `remove #8CYRL`\nOr type `cancel` to cancel the command.');
			const sepFn = (msg2, phrase) => {
				if (!phrase) return null;
				phrase = phrase.toLowerCase().split(/ +/);
				const errEm = new MessageEmbed().setColor(this.client.red);
				if (phrase.length < 4) {
					msg2.channel.send({ embeds: [errEm.setDescription('Please enter change type, club tag, role & subregion of club (if adding club)\nchnage type - add or remove\n. e.g:\n`add #8CYRLUU 694300259392929 INDIA` or `remove #8CYRLUU`\nOr type `cancel` to cancel the command.')] });
					return null;
				}
				if (!(['add', 'remove'].some(type => type === phrase[0].toLowerCase()))) {
					msg2.channel.send({ embeds: [errEm.setDescription('Please either enter add or remove to make changes, try again.')] });
					return null;
				}
				const type = phrase[0].toLowerCase();
				const tag = this.filterTag.exec(phrase[1]);
				if (!tag) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered tag ${phrase[1]} is not valid, try again.`)] });
					return null;
				}
				const club = this.client.commandHandler.resolver.type('player')(msg, tag);
				if (!club) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered tag ${phrase[1]} is not valid, try again.`)] });
					return null;
				}
				if (club.status == 404) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered tag ${phrase[1]} is not valid, try again.`)] });
					return null;
				}
				const role = this.client.commandHandler.resolver.type('role')(msg, phrase[2]);
				if (!role) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered role ${phrase[2]} is not valid, try again.`)] });
					return null;
				}
				const doc2 = this.client.clubs.items.find(i => i.id === msg2.guild.id);
				const subregion = phrase[3].toUpperCase();
				if (!doc2.subregions.includes(subregion)) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered subregion ${phrase[3]} does not exist in server settings, try again.`)] });
					return null;
				}
				return { type, club, role: role.id, subregion };
			};
			const data = await this.prompt(msg, sepFn, start);
			return this.clubsManager.exec(msg, doc, data.type, data.club, data.role, data.subregion);
		}

		case 'feeders': {
			const start = new MessageEmbed().setColor(this.client.yellow).setDescription(`The current feeders are\n${doc.clubs.map(c => `**${c}**`).join(', ') || 0}. Please enter change type and club tag to  or remove a feeder.\nChange type - \`add\` or \`remove\`\ne.g: \`add #8YCRYL00\` or \`remove #8YCRYL00\``);
			const sepFn = (msg2, phrase) => {
				if (!phrase) return null;
				phrase = phrase.toLowerCase().split(/ +/);
				const errEm = new MessageEmbed().setColor(this.client.red);
				if (phrase.length < 2) {
					msg2.channel.send({ embeds: [errEm.setDescription('Please enter change type and club tag to add or remove a feeder.\nChange type - `add` or `remove`\ne.g: `add #8YCRYL00` or `remove #8YCRYL00`')] });
					return null;
				}
				if (!(['add', 'remove'].some(type => type === phrase[0].toLowerCase()))) {
					msg2.channel.send({ embeds: [errEm.setDescription('Please either enter add or remove to make changes, try again.')] });
					return null;
				}
				const type = phrase[0].toLowerCase();
				const tag = this.filterTag.exec(phrase[1]);
				if (!tag) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered tag ${phrase[1]} is not valid, try again.`)] });
					return null;
				}
				const club = this.client.commandHandler.resolver.type('player')(msg, tag);
				if (!club) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered tag ${phrase[1]} is not valid, try again.`)] });
					return null;
				}
				if (club.status == 404) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered tag ${phrase[1]} is not valid, try again.`)] });
					return null;
				}
				return { type, club };
			};
			const data = await this.prompt(msg, sepFn, start);
			return this.feedersManager.exec(msg, doc, data.type, data.club);
		}

		case 'subregions': {
			const start = new MessageEmbed().setColor(this.client.yellow).setDescription(`The current subregions are\n${doc.subregions.map(c => `**${c}**`).join(', ') || 0}. Please enter change type, subregion & subregion role (if adding) to add or remove a subregion.\nChange type - \`add\` or \`remove\`\ne.g: \`add SRI-LANKA 675849320294949\` or \`remove INDIA\`\nOr type \`cancel\` to cancel the command.`);
			const sepFn = (msg2, phrase) => {
				if (!phrase) return null;
				phrase = phrase.toLowerCase().split(/ +/);
				const errEm = new MessageEmbed().setColor(this.client.red);
				if (phrase.length < 3) {
					msg2.channel.send({ embeds: [errEm.setDescription('Please enter change type, subregion & subregion role (if adding) to add or remove a feeder.\nChange type - `add` or `remove`\ne.g: `add SRI-LANKA 675849320294949` or `remove INDIA`\nOr type `cancel` to cancel the command.')] });
					return null;
				}
				if (!(['add', 'remove'].some(type => type === phrase[0].toLowerCase()))) {
					msg2.channel.send({ embeds: [errEm.setDescription('Please either enter add or remove to make changes, try again.')] });
					return null;
				}
				const type = phrase[0].toLowerCase();
				const subregion = phrase[1].toUpperCase();
				const role = this.client.commandHandler.resolver.type('role')(msg, phrase[2]);
				if (!role) {
					msg2.channel.send({ embeds: [errEm.setDescription(`Entered role ${phrase[2]} is not valid, try again.`)] });
					return null;
				}
				return { type, subregion, role: role.id };
			};
			const data = await this.prompt(msg, sepFn, start);
			return this.subRegionsManager.exec(msg, doc, data.type, data.subregion, data.role);
		}
		}
	}

	async prompt(msg, fn, start, retry) {
		msg.channel.send({ embeds: [start] });
		const resp = this.getResponse(msg, fn, retry);
		if (resp.status === 'cancel') return null;
		return resp.data;
	}

	async getResponse(msg, fn, retry, retries = 3) {
		const em = new MessageEmbed().setColor(this.client.red);
		if (retries) {
			retries -= 1;
			const filter = (m) => (m.author.id === msg.author.id) && (m.content.length > 0);
			let res;
			try {
				res = (await msg.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000, errors: ['timeout'] })).content;
			}
			catch (error) {
				msg.channel.send({ embeds: [em.setDescription('Time ran out, command has been cancelled.')] });
				return { status: 'cancel' };
			}
			if (res.toLowerCase() === 'cancel') {
				msg.channel.send({ embeds: [em.setDescription('Command has been cancelled.').setColor(this.client.blue)] });
				return { status: 'cancel' };
			}
			const data = await fn(msg, res);
			if (!data) {
				if (retry) msg.channel.send({ embeds: [retry] });
				return this.getResponse(msg, fn, retry, retries);
			}
			return { status: 'success', data };
		}
		msg.channel.send({ embeds: [em.setDescription('You ran out of retires, command has been cancelled.')] });
		return { status: 'cancel' };
	}

}

module.exports = SettingsCommand;
