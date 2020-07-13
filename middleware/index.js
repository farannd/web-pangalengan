const multer = require('multer');

//models
const Tourist = require('../models/tourist');
const Galleries = require('../models/gallery');

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
		return res.redirect('back');
	},

	//check if admin
	isAdminLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()) {
			if (req.user.isAdmin) return next();
			else {
				req.flash('warning', "You don't have permission to use this features");
				return res.redirect('/404');
			}
		} else {
			req.flash('warning', 'You must log in first to use this features');
			return res.redirect('/login');
		}
	},

	//check authorization for tourist post
	checkPostTouristOwnership: (req, res, next) => {
		if (req.isAuthenticated()) {
			let id = req.params.id;
			Tourist.findById(id, (err, foundPost) => {
				if (err || !foundPost) {
					req.flash('warning', 'Sorry. The post you want to access is never exist in the first place');
					return res.redirect('/tourist-attraction');
				} else if (foundPost.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash('warning', "You don't have permission to make a change on this post");
					return res.redirect('/tourist-attraction');
				}
			});
		} else {
			req.flash('warning', 'You must log in first to use this features');
			return res.redirect('/login');
		}
	},

	//check authorization for gallery post
	checkPostGalleryOwnership: (req, res, next) => {
		if (req.isAuthenticated()) {
			let id = req.params.id;
			Galleries.findById(id, (err, foundPost) => {
				if (err || !foundPost) {
					req.flash('warning', 'Sorry. The post you want to access is never exist in the first place');
					return res.redirect('/gallery');
				} else if (foundPost.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash('warning', "You don't have permission to make a change on this post");
					return res.redirect('/gallery');
				}
			});
		} else {
			req.flash('warning', 'You must log in first to use this features');
			return res.redirect('/login');
		}
	}
};

module.exports = middleware;
