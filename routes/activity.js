//package requirements
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/index');

//models
const Activities = require('../models/activity');

//Routes
//index
router.get('/activity', (req, res) => {
	Activities.find().sort({ _id: -1 }).limit(10).exec((err, postsRandom) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('activity/index', {
				posts: null,
				random1: null,
				random2: null
			});
		} else if (!postsRandom.length) {
			res.render('activity/index', {
				posts: null,
				random1: null,
				random2: null,
				page: null
			});
		} else {
			//paginate
			let page = 1;
			let skip = 0;
			let limit = 4;
			if (req.query.page) {
				page = parseInt(req.query.page, 10);
				skip = (page - 1) * limit;
			}

			//randomposts
			let num1 = Math.floor(Math.random() * postsRandom.length);
			let num2 = Math.floor(Math.random() * postsRandom.length);
			// run this loop until numberOne is different than numberThree
			if (postsRandom.length > 1) {
				do {
					num1 = Math.floor(Math.random() * postsRandom.length);
				} while (num1 === num2);
			}

			Activities.find().sort({ _id: -1 }).limit(limit).skip(skip).exec((err, posts) => {
				if (err) {
					req.flash('warning', 'Something went wrong, please try again later');
					res.render('activity/index', {
						posts: null,
						random1: null,
						random2: null
					});
				} else if (!posts.length) {
					res.render('activity/index', {
						posts: null,
						random1: null,
						random2: null,
						page: null
					});
				} else {
					res.render('activity/index', {
						posts: posts,
						random1: postsRandom[num1],
						random2: postsRandom[num2],
						page: page
					});
				}
			});
		}
	});
});

//show new
router.get('/activity/new', middleware.isAdminLoggedIn, (req, res) => {
	res.render('activity/new');
});

//post new
router.post('/activity', [ middleware.upload.single('image'), middleware.isAdminLoggedIn ], (req, res) => {
	if (!req.file) {
		req.flash('warning', 'Please upload an image');
		res.redirect('/activity/new');
	} else if (!req.body.title) {
		req.flash('warning', 'Please input a title');
		res.redirect('/activity/new');
	} else if (!req.body.content) {
		req.flash('warning', 'Please input a content');
		res.redirect('/activity/new');
	} else if (req.file.size > 500000) {
		req.flash(
			'warning',
			'Ukuran file anda adalah ' +
				req.file.size / 1000000 +
				' mb. Harap melakukan compress terlebih dahulu terhadap file'
		);
		res.redirect('/activity/new');
	} else {
		let obj = {
			content: req.body.content,
			title: req.body.title.toLowerCase(),
			video: req.body.video ? req.body.video : null,
			file: req.body.file ? req.body.file : null,
			image: {
				data: req.file.buffer,
				contentType: req.file.mimetype
			},
			author: {
				id: req.user.id,
				username: req.user.username
			}
		};
		Activities.create(obj, (err, post) => {
			if (err) {
				req.flash('warning', 'Something went wrong, please try again later');
				res.redirect('/activity');
			} else {
				req.flash('success', 'You have successfully uploaded the post');
				res.redirect('/activity');
			}
		});
	}
});

//show individual post
router.get('/activity/:id', (req, res) => {
	let id = req.params.id;
	Activities.findById(id, (err, post) => {
		if (err || !post) {
			req.flash('warning', 'Sorry. The post you want to access is never exist in the first place');
			res.redirect('/activity');
		} else {
			res.render('activity/show', { post: post });
		}
	});
});

//show edit
router.get('/activity/:id/edit', middleware.isAdminLoggedIn, (req, res) => {
	let id = req.params.id;
	Activities.findById(id, (err, post) => {
		if (err || !post) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/activity');
		} else {
			res.render('activity/edit', { post: post });
		}
	});
});

//update post activity
router.put('/activity/:id', [ middleware.upload.single('image'), middleware.isAdminLoggedIn ], (req, res) => {
	if (!req.body.title) {
		req.flash('warning', 'Please input a title');
		res.redirect('/activity/new');
	} else if (!req.body.content) {
		req.flash('warning', 'Please input a content');
		res.redirect('/activity/new');
	} else {
		let id = req.params.id;
		let obj = {};
		if (req.file) {
			if (req.file.size > 500000) {
				req.flash(
					'warning',
					'Ukuran file anda adalah ' +
						req.file.size / 1000000 +
						' mb. Harap melakukan compress terlebih dahulu terhadap file'
				);
				res.redirect('/activity/' + id + '/edit');
			} else {
				obj = {
					content: req.body.content,
					title: req.body.title.toLowerCase(),
					video: req.body.video ? req.body.video : null,
					file: req.body.file ? req.body.file : null,
					image: {
						data: req.file.buffer,
						contentType: req.file.mimetype
					}
				};
				Activities.findByIdAndUpdate(id, obj, (err, post) => {
					if (err) {
						req.flash('warning', 'Something went wrong, please try again later');
						res.redirect('/activity');
					} else {
						req.flash('success', 'You have successfully updated the post');
						res.redirect('/activity/' + id);
					}
				});
			}
		} else {
			obj = {
				content: req.body.content,
				title: req.body.title.toLowerCase(),
				video: req.body.video ? req.body.video : null,
				file: req.body.file ? req.body.file : null
			};
			Activities.findByIdAndUpdate(id, obj, (err, post) => {
				if (err) {
					req.flash('warning', 'Something went wrong, please try again later');
					res.redirect('/activity');
				} else {
					req.flash('success', 'You have successfully updated the post');
					res.redirect('/activity/' + id);
				}
			});
		}
	}
});

//cascade delete post and comment associated with it
router.delete('/activity/:id', middleware.isAdminLoggedIn, (req, res) => {
	let id = req.params.id;
	Activities.findById(id, (err, foundPost) => {
		if (err || !foundPost) {
			req.flash('warning', 'Something went wrong, please try again later');
			return res.redirect('/activity');
		} else {
			// let commentLength = foundPost.comment.length;
			// for (let i = 0; i < commentLength; i++) {
			// 	Comment.findByIdAndDelete(foundPost.comment[i]._id, (err, result) => {
			// 		if (err) console.log(err.message);
			// 	});
			// }
			foundPost.deleteOne();
			req.flash('success', 'You have successfully deleted the post');
			return res.redirect('/activity');
		}
	});
});

//search post
router.post('/activity/search', (req, res) => {
	let search = req.body.search;
	res.redirect('/activity/search/' + search);
});

//search show
router.get('/activity/search/:search', (req, res) => {
	Activities.find({ title: new RegExp(req.params.search, 'i') }, (err, postsSearch) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/activity');
		} else if (!postsSearch.length) {
			res.render('activity/search', { search: req.params.search, posts: null });
		} else {
			res.render('activity/search', { posts: postsSearch.reverse(), search: req.params.search });
		}
	});
});

module.exports = router;
