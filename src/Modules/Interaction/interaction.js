const { AkairoModule } = require('discord-akairo');
// eslint-disable-next-line no-unused-vars
const { Message, MessageEmbed, MessageComponentInteraction, User } = require('discord.js');

class InteractionMenu extends AkairoModule {
	/**
	 * @param {string} id
	 * @param {{
	 * directory: string,
	 * classToHandle: Interaction
	 * }} options
	 */
	constructor(id, options = {}) {
		super(id, options);
		const {
			selectMenu = {
				
			},
		} = options;

		this.selectMenu;
		this.values = [];
	}

	exec() {
		throw new Error('Not implemented!');
	}

	getSelectValues() {
		let int = 0;
		const groups = this.selectMenuOptions.reduce((acc, option, index, array) => {
			if (!acc.length) {
				acc.push([option]);
				return acc;
			}
			else if (acc[int].length < 23) {
				acc[int].push(option);
				return acc;
			}
			else if ((acc[int].length == 23) && array[index + 1]) {
				acc[int].push({
					label: 'Confirm',
					value: 'confirmed',
					description: 'To confirm your given values',

				});
			}
		}, []);

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
	}

	/**
	 * @param {User} author
	 * @param {Message} msgSent
	 * @param {string} customId
	 * @param {number} time that is left till you die
	 * @returns {Promise<null|MessageComponentInteraction>} null or MessageComponentInteraction
	 */
	async awaitComponent(author, msgSent, customId, time) {
		const filter = (i) => (i.user.id === author.id) && i.isSelectMenu() && i.customId === customId;
		try {
			return await msgSent.awaitMessageComponent({ filter, time });
		}
		catch (error) {
			msgSent.edit({ embeds: [new MessageEmbed().setColor(this.client.red).setDescription('Timeout, command has been cancelled.')], components: [] });
			return null;
		}
	}
}

module.exports = InteractionMenu;