const mongoose = require('mongoose');

var aboutSchema = new mongoose.Schema({
	image: {
		data: Buffer,
		contentType: String
	},
	content: String
	// author: {
	// 	id: {
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: 'User'
	// 	},
	// 	username: String
	// }
});

module.exports = mongoose.model('Abouts', aboutSchema);
