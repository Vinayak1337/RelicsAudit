const { MongooseProvider } = require('discord-akairo');
const { Collection } = require('discord.js');
/**
 * Provider using the `Mongoose` library.
 * @param {Model} model - A Mongoose model.
 * @extends {MongooseProvider}
 */
class ClubProvider extends MongooseProvider {
	constructor(model) {
		super(model);
		this.verified = [];
		this.items = new Collection();
	}

	async setVerified() {
		const guilds = await this.model.find({ verified: true });
		for (const guild of guilds) {
			this.verified.push(guild.id);
		}
	}

	async init() {
		const docs = await this.model.find({});
		for (const doc of docs) this.items.set(doc.tag, doc);
	}
	/**
     * @param {string} id - guildID to check in.
     * @param {string} userid - userID to check for.
     * @returns {Boolean} - If user is manager or not.
     */
	async isManager(guildID, userID, guild) {
		if (!guild) guild = this.items.find(doc => doc.id === guildID);
		return guild?.members?.managers?.includes(userID) || false;
	}

	/**
     * @param {string} id - guildID to check in.
     * @param {string} userid - userID to check for.
     * @returns {Boolean} - If user is verifier of the guild or not.
     */
	async isVerifier(guildID, userID, guild) {
		if (!guild) guild = this.items.find(doc => doc.id === guildID);
		return guild?.members?.verificationteam?.includes(userID) || false;
	}

	/**
     * @param {object} query - query to search for.
     * @returns {Promise<Object>} - Mongoose query object|document
     */
	findOne(query) {
		return this.model.findOne(query);
	}

	/**
     * @returns {Promise<Array>} - Mongoose query objects|documents.
     */
	find() {
		return this.model.find();
	}

	/**
     * Saves a document.
     * @param {string} key - key to set modified path.
     * @param {string} doc - Mongoose document to save.
     * @returns {Promise<any>} - Mongoose query object|document
     */
	save(key, doc) {
		doc.markModified(key);
		return doc.save();
	}

	/**
     * Gets the first item.
     * @returns {Promise<any>} Mongoose query object|document
     */

	async first() {
		const guilds = await this.model.find();
		return guilds[0];
	}

	/**
     * Gets a value.
     * @param {string} id - guildID.
     * @param {string} key - The key to get.
     * @param {any} [defaultValue] - Default value if not found or null.
     * @returns {any}
     */
	async get(id, key, defaultValue) {
		const doc = this.items.find(item => item.id === id);
		if (doc && doc[key]) return doc[key];
		return defaultValue;
	}

	/**
     * Sets a value.
     * @param {string} id - guildID.
     * @param {string} key - The key to set in.
     * @param {any} value - The value to set.
     * @returns {Promise<any>} - Mongoose query object|document
     */
	async set(id, key, value) {
		const doc = this.items.find(item => item.id === id);
		if (!doc) return false;
		doc[key] = value;
		doc.markModified(key);
		return doc.save();
	}

	/**
     * Push a value into an array.
     * @param {string} id - guildID.
     * @param {string} key - The key to push in.
     * @param {string} value - The value to push.
     * @returns {Promise<any>} - Mongoose query object|document
     */
	async push(id, key, value) {
		const doc = await this.getDocument(id);
		if (!doc) return false;
		doc[key].push(value);
		doc.markModified(key);
		return doc.save();
	}

	/**
     * Deletes a value.
     * @param {string} id - guildID.
     * @param {string} key - The key to delete.
     * @returns {Promise<any>} - Mongoose query object|document
     */
	async clear(id, key) {
		const doc = await this.getDocument(id);
		if (!doc) return false;
		delete doc[key];
		doc.markModified(key);
		return doc.save();
	}

	/**
     * Removes a document.
     * @param {string} id - GuildID.
     * @returns {Boolean}
     */
	async delete(id) {
		const doc = await this.getDocument(id);
		if (doc) {
			await doc.remove();
			return true;
		}
		return false;
	}

	/**
     * Gets a document by guildID.
     * @param {string} id - guildID.
     * @returns {Promise<any>} - Mongoose query object|document
     */
	async getDocument(id) {
		return await this.model.findOne({ id });
	}
}

module.exports = ClubProvider;