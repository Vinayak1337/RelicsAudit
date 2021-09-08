const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = new Schema({
	id: {
		type: String,
	},
	tag: {
		type: String,
		unique: true,
		required: true,
	},
	separator: {
		type: String,
		default: '❯',
	},
	prefix: {
		type: String,
		default: '+',
	},
	type: {
		type: String,
	},
	club: {
		type: Object,
		default: {},
	},
	region: {
		type: String,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	subregion: {
		type: String,
	},
	subregions: {
		type: Array,
	},
	invite: {
		type: String,
	},
	hubserver: {
		type: String,
	},
	feeders: {
		type: Array,
	},
	clubs: {
		type: Array,
	},
	blacklist: {
		type: Array,
		default: [],
	},
	channels: {
		type: Object,
		default: {},
	},
	roles: {
		type: Object,
		default: {},
	},
	members: {
		type: Object,
		default: {},
	},
	messages: {
		type: Object,
		default: {},
	},
	logs: {
		type: Array,
		default: [],
	},
}, { minimize: false });

module.exports = mongoose.model('clubs', guildSchema);