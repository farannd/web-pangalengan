const mongoose = require('mongoose');

var gallerySchema = new mongoose.Schema({
	content: String,
	like: Number,
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

module.exports = mongoose.model('Galleries', gallerySchema);
