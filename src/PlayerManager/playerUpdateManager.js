const { MessageEmbed } = require('discord.js');

class PlayerUpdateManager {
	constructor(client, player, playerData, clubData, member, verifier, sentMsg, newMember, channelID, guildID, url) {
		this.client = client;
		this.player = player;
		this.playerData = playerData;
		this.clubData = clubData || {};
		this.member = member;
		this.embed = new MessageEmbed();
		this.sentMsg = sentMsg;
		this.verifier = verifier || client.user;
		this.newMember = newMember || false;
		this.memberSaved = false;
		this.channelID = channelID;
		this.guildID = guildID;
		this.url = url;
	}
	auditPlayer() {
		if ((this.player.name === this.playerData.name) && (this.player.club.tag == this.clubData.tag) && (this.player.role == this.clubData.members.find(m => m.tag === this.player.tag).role)) {
			this.embed.setColor(this.client.blue)
				.setDescription('No updates available, please try later once you change club, name or role in the club.');
			this.sentMsg.edit({ embeds: [this.embed] });
			return false;
		}
		return true;
	}
	async updatePlayer() {
		if (!(this.player.name === this.playerData.name)) {
			this.player.lastnames.push(this.playerData.name);
		}
		this.player.id = this.member.id;
		this.player.player = JSON.parse(JSON.stringify(this.playerData));
		this.player.role = this.clubData.members?.find(m => m.tag === this.player.tag)?.role || null;
		this.player.club = {
			tag: this.clubData.tag,
			name: this.clubData.name,
		};
		this.player.trophies = this.playerData.trophies;
		this.player.icon = this.playerData.icon;
		this.player.name = this.playerData.name;
		this.player.verified = true;
		if (this.newMember) {
			this.player.verification = {
				at: Date.now(),
				by: this.verifier.id,
				in: {
					channelID: this.channelID,
					guildID: this.guildID,
				},
				url: this.url,
			};
		}
		return await this.player.save();
	}
	async createPlayer() {
		const player = {
			id: this.member.id,
			tag: this.playerData.tag,
			name: this.playerData.name,
			role: this.clubData.members?.find(m => m.tag === this.playerData.tag)?.role,
			icon: this.playerData.icon, trophies: this.playerData.trophies,
			club: { tag: this.clubData.tag, name: this.clubData.name },
			ladder: { ['328479586297839618']: false },
			verification: { at: Date.now(), by: this.verifier.id, in: { channelID: this.channelID, guildID: this.guildID }, url: this.url },
			verified: true,
			player: JSON.parse(JSON.stringify(this.playerData)),
		};
		const playerDoc = await new this.client.players.model(player).save();
		this.client.players.items.set(playerDoc.id, playerDoc);
		return playerDoc;
	}
}
module.exports = PlayerUpdateManager;