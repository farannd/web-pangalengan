const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	isAdmin: { type: Boolean, default: false },
	password: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose, { maxAttempts: 5 });

module.exports = mongoose.model('User', userSchema);
