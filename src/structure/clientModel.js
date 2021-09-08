const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
	id: {
		type: String,
		unique: true,
		required: true,
	},
	settings: {
		type: Object,
	},
}, { minimize: false });

module.exports = mongoose.model('globals', clientSchema);