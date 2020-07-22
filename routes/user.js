//package requirements
const express = require('express');
const passport = require('passport');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');
const middleware = require('../middleware/index');
const router = express.Router();

//models
const User = require('../models/user');
const Activities = require('../models/activity');
const Tourist = require('../models/tourist');
const Galleries = require('../models/gallery');

//register
router.get('/register', middleware.isLoggedOut, (req, res) => {
	return res.render('user/register');
});
router.post('/register', middleware.isLoggedOut, (req, res) => {
	User.find({ email: req.body.email }, (err, doc) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/register');
		} else if (doc.length > 0) {
			req.flash('warning', 'A user with the given email is already registered');
			return res.redirect('/register');
		} else {
			let newUser = null;
			if (req.body.secret === 'pangalengan') {
				newUser = new User({
					username: req.body.username.toLowerCase(),
					email: req.body.email
				});
			} else if (req.body.secret === 'pangalenganadmin') {
				newUser = new User({
					username: req.body.username,
					email: req.body.email,
					isAdmin: true
				});
			} else {
				req.flash('warning', 'Your secret code is invalid');
				return res.redirect('/register');
			}
			User.register(newUser, req.body.password, (err, result) => {
				if (err || !result) {
					req.flash('warning', err.message);
					return res.redirect('/register');
				} else {
					passport.authenticate('local')(req, res, () => {
						req.flash('success', 'Your account have successfuly created. Welcome to Pangalengan!');
						return res.redirect('/profile/' + result._id);
					});
				}
			});
		}
	});
});

//login
router.get('/login', middleware.isLoggedOut, (req, res) => {
	return res.render('user/login');
});
router.post('/login', middleware.isLoggedOut, (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			req.flash('warning', err.message);
			return res.redirect('/login');
		}
		if (!user) {
			req.flash('warning', info.message);
			return res.redirect('/login');
		}
		req.logIn(user, function(err) {
			if (err) {
				req.flash('warning', info.message);
				return res.redirect('/login');
			}
			req.flash('success', 'Welcome back ' + user.username);
			return res.redirect('/profile/' + user._id);
		});
	})(req, res, next);
});

//logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'You have successfully logged out');
	return res.redirect('/login');
});

//profile
router.get('/profile/:id', middleware.isLoggedIn, (req, res) => {
	let id = req.params.id;
	//paginate
	let page = 1;
	let skip = 0;
	let limit = 6;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
		skip = (page - 1) * limit;
	}
	User.findById(id, (err, user) => {
		if (err || !user) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('back');
		} else {
			Activities.find({ 'author.username': user.username })
				.sort({ _id: -1 })
				.limit(limit)
				.skip(skip)
				.exec((err, posts) => {
					if (err) {
						req.flash('warning', 'Something went wrong, please try again later');
						res.redirect('back');
					} else if (!posts.length) {
						res.render('user/profile', { user: user, posts: null, page: null });
					} else {
						for (let x = 0; x < posts.length; x++) {
							posts[x].content = sanitizeHtml(posts[x].content, {
								allowedTags: [],
								allowedAttributes: {}
							});
						}
						res.render('user/profile', { user: user, posts: posts, page: page });
					}
				});
		}
	});
});

router.get('/profile/:id/tourist-attraction', middleware.isLoggedIn, (req, res) => {
	let id = req.params.id;
	//paginate
	let page = 1;
	let skip = 0;
	let limit = 6;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
		skip = (page - 1) * limit;
	}
	User.findById(id, (err, user) => {
		if (err || !user) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('back');
		} else {
			Tourist.find({ 'author.username': user.username })
				.sort({ _id: -1 })
				.limit(limit)
				.skip(skip)
				.exec((err, posts) => {
					if (err) {
						req.flash('warning', 'Something went wrong, please try again later');
						res.redirect('back');
					} else if (!posts.length) {
						res.render('user/profile_attraction', { user: user, posts: null, page: null });
					} else {
						res.render('user/profile_attraction', { user: user, posts: posts, page: page });
					}
				});
		}
	});
});

router.get('/profile/:id/gallery', middleware.isLoggedIn, (req, res) => {
	let id = req.params.id;
	//paginate
	let page = 1;
	let skip = 0;
	let limit = 6;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
		skip = (page - 1) * limit;
	}
	User.findById(id, (err, user) => {
		if (err || !user) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('back');
		} else {
			Galleries.find({ 'author.username': user.username })
				.sort({ _id: -1 })
				.limit(limit)
				.skip(skip)
				.exec((err, posts) => {
					if (err) {
						req.flash('warning', 'Something went wrong, please try again later');
						res.redirect('back');
					} else if (!posts.length) {
						res.render('user/profile_gallery', { user: user, posts: null, page: null });
					} else {
						res.render('user/profile_gallery', { user: user, posts: posts, page: page });
					}
				});
		}
	});
});

//forgot
router.get('/forgot', (req, res) => {
	res.render('user/forgot');
});
router.post('/forgot', function(req, res, next) {
	async.waterfall(
		[
			function(done) {
				crypto.randomBytes(20, function(err, buf) {
					let token = buf.toString('hex');
					done(err, token);
				});
			},
			function(token, done) {
				User.findOne({ email: req.body.email }, function(err, user) {
					if (!user) {
						req.flash('error', 'No account with that email address exists.');
						return res.redirect('/forgot');
					}

					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

					user.save(function(err) {
						done(err, token, user);
					});
				});
			},
			function(token, user, done) {
				let smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: 'webpangalengan@gmail.com',
						pass: process.env.GMAILPW
					}
				});
				let mailOptions = {
					to: user.email,
					from: 'webpangalengan@gmail.com',
					subject: 'Node.js Password Reset',
					text:
						'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
						'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
						'http://' +
						req.headers.host +
						'/reset/' +
						token +
						'\n\n' +
						'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					console.log('mail sent');
					req.flash(
						'success',
						'An e-mail has been sent to ' +
							user.email +
							" with further instructions. if you don't see the email in the inbox then try looking in the spam folder "
					);
					done(err, 'done');
				});
			}
		],
		function(err) {
			if (err) return next(err);
			res.redirect('/forgot');
		}
	);
});

//reset password
router.get('/reset/:token', function(req, res) {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(
		err,
		user
	) {
		if (!user) {
			req.flash('error', 'Password reset token is invalid or has expired.');
			return res.redirect('/forgot');
		}
		res.render('user/reset', { token: req.params.token });
	});
});

router.post('/reset/:token', function(req, res) {
	async.waterfall(
		[
			function(done) {
				User.findOne(
					{ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
					function(err, user) {
						if (!user) {
							req.flash('error', 'Password reset token is invalid or has expired.');
							return res.redirect('/forgot');
						}
						if (req.body.password === req.body.confirm) {
							user.setPassword(req.body.password, function(err) {
								user.resetPasswordToken = undefined;
								user.resetPasswordExpires = undefined;

								user.save(function(err) {
									req.logIn(user, function(err) {
										done(err, user);
									});
								});
							});
						} else {
							req.flash('warning', 'Passwords do not match.');
							return res.redirect('back');
						}
					}
				);
			},
			function(user, done) {
				let smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: 'webpangalengan@gmail.com',
						pass: process.env.GMAILPW
					}
				});
				let mailOptions = {
					to: user.email,
					from: 'webpangalengan@mail.com',
					subject: 'Your password has been changed',
					text:
						'Hello,\n\n' +
						'This is a confirmation that the password for your account ' +
						user.email +
						' has just been changed.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					req.flash('success', 'Success! Your password has been changed.');
					done(err);
				});
			}
		],
		function(err) {
			req.flash('warning', err);
			res.redirect('/activity');
		}
	);
});

module.exports = router;
