const multer = require('multer');

const middleware = {
	//multer config
	upload: multer({
		limits: { fileSize: 10000000 },
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
				//allowed file extensions
				return cb(new Error('please upload png,jpeg or jpg'));
			}
			cb(undefined, true);
		}
	}),

	//check if user logged in
	isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()) return next();
		req.flash('warning', 'You must log in first to use this features');
		return res.redirect('/login');
	},

	//check if user logged out
	isLoggedOut: (req, res, next) => {
		if (!req.isAuthenticated()) return next();
		req.flash('warning', 'You already logged in');
		return res.redirect('/activity');
	}
};

module.exports = middleware;
