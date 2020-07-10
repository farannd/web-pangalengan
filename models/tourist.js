const mongoose = require('mongoose');

var touristSchema = new mongoose.Schema({
	content: String,
	title: String,
	category: String,
	image: [
		{
			data: Buffer,
			contentType: String
		}
	]
	// author: {
	// 	id: {
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: 'User'
	// 	},
	// 	username: String
	// }
});

module.exports = mongoose.model('Tourist', touristSchema);
