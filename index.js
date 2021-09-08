const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { AuditClient } = require('./src/structure/handlers');
dotenv.config();
run();

async function run() {
	try {
		const client = new AuditClient();
		await mongoose.connect(process.env.URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true
		});
		console.log('✅ Connected to database');
		client.login(process.env.TOKEN);
	} catch (error) {
		console.log(error);
	}
}
