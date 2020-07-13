const mongoose = require('mongoose');

var aboutSchema = new mongoose.Schema({
	image: {
		data: Buffer,
		contentType: String
	},
	content: String
});

module.exports = mongoose.model('Abouts', aboutSchema);
