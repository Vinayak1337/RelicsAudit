const { MongooseProvider } = require('discord-akairo');

/**
 * Provider using the `Mongoose` library.
 * @param {Model} model - A Mongoose model.
 * @extends {MongooseProvider}
 */
class ClientProvider extends MongooseProvider {
	constructor(model) {
		super(model);
	}

	async init() {
		const doc = await this.first();
		this.items.set(doc.id, doc.settings);
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
		const doc = await this.getDocument(id);
		if (doc.settings[key]) return doc.settings[key];
		return defaultValue;
	}

	/**
     * Sets a value.
     * @param {string} id - guildID.
     * @param {string} key - The key to set in.
     * @param {any} value - The value to set.
     * @returns {Promise<any>} - Mongoose query object|document
     */
	async set(key, value) {
		const doc = await this.first();
		doc.settings[key] = value;
		return await this.save(doc);
	}

	/**
     * Push a value into an array.
     * @param {string} id - guildID.
     * @param {string} key - The key to push in.
     * @param {string} value - The value to push.
     * @returns {Promise<any>} - Mongoose query object|document
     */
	async push(key, value) {
		const doc = await this.first();
		doc.settings[key].push(value);
		return await this.save(doc);
	}

	/**
     * Deletes a value.
     * @param {string} id - guildID.
     * @param {string} key - The key to delete.
     * @returns {Promise<any>} - Mongoose query object|document
     */
	async clear(key) {
		const doc = await this.first();
		delete doc.settings[key];
		return await this.save(doc);
	}

	async save(doc) {
		doc.markModified('settings');
		return doc.save();
	}
}

module.exports = ClientProvider;

