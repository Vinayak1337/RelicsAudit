const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playersSchema = new Schema({
	id: {
		type: String,
	},
	tag: {
		type: String,
		unique: true,
		required: true,
	},
	name: {
		type: String,
	},
	icon: {
		type: Object,
		default: {},
	},
	trophies: {
		type: Number,
	},
	role: {
		type: String,
	},
	lastnames: {
		type: Array,
		default: [],
	},
	club: {
		type: Object,
		default: {},
	},
	ladder: {
		type: Object,
		default: {},
	},
	verification: {
		type: Object,
		default: {
			['328479586297839618']: false,
		},
	},
	verified: {
		type: Boolean,
		default: false,
	},
	player: {
		type: Object,
		default: {},
	},
}, { minimize: false });

module.exports = mongoose.model('players', playersSchema);

exports.playersSchema = playersSchema;