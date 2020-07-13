const mongoose = require('mongoose');

var activitySchema = new mongoose.Schema({
	content: String,
	title: String,
	video: String,
	file: String,
	image: {
		data: Buffer,
		contentType: String
	},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	}
});

module.exports = mongoose.model('Activities', activitySchema);
