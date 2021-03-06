//package requirements
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/index');
const Tourist = require('../models/tourist');

//index
router.get('/tourist-attraction', (req, res) => {
	let page = 1;
	let skip = 0;
	let limit = 6;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
		skip = (page - 1) * limit;
	}

	Tourist.find().sort({ _id: -1 }).limit(limit).skip(skip).exec((err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('tourist/index', { posts: null });
		} else if (!posts.length) {
			res.render('tourist/index', { posts: null, page: null });
		} else {
			let currentIndex = posts.length,
				temporaryValue,
				randomIndex;

			//randomize array
			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = posts[currentIndex];
				posts[currentIndex] = posts[randomIndex];
				posts[randomIndex] = temporaryValue;
			}

			res.render('tourist/index', { posts: posts, page: page });
		}
	});
});

//index for attraction only
router.get('/tourist-attraction/attraction', (req, res) => {
	let page = 1;
	let skip = 0;
	let limit = 6;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
		skip = (page - 1) * limit;
	}

	Tourist.find({ category: 'attraction' }).sort({ _id: -1 }).limit(limit).skip(skip).exec((err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('tourist/attraction', { posts: null });
		} else if (!posts.length) {
			res.render('tourist/attraction', { posts: null, page: null });
		} else {
			let currentIndex = posts.length,
				temporaryValue,
				randomIndex;

			//randomize array
			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = posts[currentIndex];
				posts[currentIndex] = posts[randomIndex];
				posts[randomIndex] = temporaryValue;
			}

			res.render('tourist/attraction', { posts: posts, page: page });
		}
	});
});

//index for lodging only
router.get('/tourist-attraction/lodging', (req, res) => {
	let page = 1;
	let skip = 0;
	let limit = 6;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
		skip = (page - 1) * limit;
	}

	Tourist.find({ category: 'lodging' }).sort({ _id: -1 }).limit(limit).skip(skip).exec((err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('tourist/lodging', { posts: null });
		} else if (!posts.length) {
			res.render('tourist/lodging', { posts: null, page: null });
		} else {
			let currentIndex = posts.length,
				temporaryValue,
				randomIndex;

			//randomize array
			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = posts[currentIndex];
				posts[currentIndex] = posts[randomIndex];
				posts[randomIndex] = temporaryValue;
			}

			res.render('tourist/lodging', { posts: posts, page: page });
		}
	});
});

//index for restaurant only
router.get('/tourist-attraction/restaurant', (req, res) => {
	let page = 1;
	let skip = 0;
	let limit = 6;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
		skip = (page - 1) * limit;
	}
	Tourist.find({ category: 'restaurant' }).sort({ _id: -1 }).limit(limit).skip(skip).exec((err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('tourist/restaurant', { posts: null });
		} else if (!posts.length) {
			res.render('tourist/restaurant', { posts: null, page: null });
		} else {
			let currentIndex = posts.length,
				temporaryValue,
				randomIndex;

			//randomize array
			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = posts[currentIndex];
				posts[currentIndex] = posts[randomIndex];
				posts[randomIndex] = temporaryValue;
			}

			res.render('tourist/restaurant', { posts: posts, page: page });
		}
	});
});

//show new page
router.get('/tourist-attraction/new', middleware.isLoggedIn, (req, res) => {
	res.render('tourist/new');
});

//post new
router.post('/tourist-attraction', [ middleware.upload.array('image', 12), middleware.isLoggedIn ], (req, res) => {
	if (req.files.length > 2) {
		req.flash('warning', 'Max input for images is 2');
		res.redirect('back');
	} else if (!req.body.title) {
		req.flash('warning', 'Please input a title');
		res.redirect('back');
	} else if (!req.body.content) {
		req.flash('warning', 'Please input a content');
		res.redirect('back');
	} else if (req.files.length < 3 && req.files.length > 0) {
		let fileSize = 0;
		for (let x = 0; x < req.files.length; x++) {
			fileSize = fileSize + req.files[x].size;
		}
		if (fileSize > 500000) {
			req.flash(
				'warning',
				'Ukuran file anda adalah ' +
					fileSize / 1000000 +
					' mb. Harap melakukan compress terlebih dahulu terhadap file'
			);
			res.redirect('/tourist-attraction/new');
		} else {
			let images = [];
			for (let x = 0; x < req.files.length; x++) {
				images.push({ data: req.files[x].buffer, contentType: req.files[x].mimetype });
				fileSize = fileSize + req.files[x].size;
			}
			let obj = {
				content: req.body.content,
				title: req.body.title.toLowerCase(),
				category: req.body.category,
				contact: req.body.contact,
				image: [ ...images ],
				author: {
					id: req.user.id,
					username: req.user.username
				}
			};
			Tourist.create(obj, (err, doc) => {
				if (err || !doc) {
					req.flash('warning', 'Something went wrong, please try again later');
					res.redirect('/tourist-attraction');
				} else {
					req.flash('success', 'You have successfully uploaded the post');
					res.redirect('/tourist-attraction');
				}
			});
		}
	} else if (req.files.length == 0) {
		let obj = {
			content: req.body.content,
			title: req.body.title.toLowerCase(),
			category: req.body.category,
			contact: req.body.contact,
			image: null,
			author: {
				id: req.user.id,
				username: req.user.username
			}
		};
		Tourist.create(obj, (err, doc) => {
			if (err || !doc) {
				req.flash('warning', 'Something went wrong, please try again later');
				res.redirect('/tourist-attraction');
			} else {
				req.flash('success', 'You have successfully uploaded the post');
				res.redirect('/tourist-attraction');
			}
		});
	}
});

//show individual post
router.get('/tourist-attraction/:id', (req, res) => {
	let id = req.params.id;
	Tourist.findById(id, (err, post) => {
		if (err || !post) {
			req.flash('warning', 'Sorry. The post you want to access is never exist in the first place');
			res.redirect('/tourist-attraction');
		} else {
			res.render('tourist/show', { post: post });
		}
	});
});

//show edit
router.get('/tourist-attraction/:id/edit', middleware.checkPostTouristOwnership, (req, res) => {
	let id = req.params.id;
	Tourist.findById(id, (err, post) => {
		if (err || !post) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/tourist-attraction');
		} else {
			res.render('tourist/edit', { post: post });
		}
	});
});

//post edit
router.put(
	'/tourist-attraction/:id',
	[ middleware.upload.array('image', 12), middleware.checkPostTouristOwnership ],
	(req, res) => {
		let id = req.params.id;

		if (req.files.length > 2) {
			req.flash('warning', 'Max input for images is 4');
			res.redirect('back');
		} else if (!req.body.title) {
			req.flash('warning', 'Please input a title');
			res.redirect('back');
		} else if (!req.body.content) {
			req.flash('warning', 'Please input a content');
			res.redirect('back');
		} else if (req.files.length < 3 && req.files.length > 0) {
			let fileSize = 0;
			for (let x = 0; x < req.files.length; x++) {
				fileSize = fileSize + req.files[x].size;
			}
			if (fileSize > 500000) {
				req.flash(
					'warning',
					'Ukuran file anda adalah ' +
						fileSize / 1000000 +
						' mb. Harap melakukan compress terlebih dahulu terhadap file karena sudah melebihi ketentuan'
				);
				res.redirect('/tourist-attraction/' + id + '/edit');
			} else {
				let images = [];
				for (let x = 0; x < req.files.length; x++) {
					images.push({ data: req.files[x].buffer, contentType: req.files[x].mimetype });
				}
				let obj = {
					content: req.body.content,
					title: req.body.title.toLowerCase(),
					category: req.body.category,
					contact: req.body.contact,
					image: [ ...images ]
				};
				Tourist.findByIdAndUpdate(id, obj, (err, post) => {
					if (err || !post) {
						req.flash('warning', 'Something went wrong, please try again later');
						res.redirect('/tourist-attraction');
					} else {
						req.flash('success', 'You have successfully updated the post');
						return res.redirect('/tourist-attraction/' + id);
					}
				});
			}
		} else if (req.files.length == 0) {
			let obj = {
				content: req.body.content,
				title: req.body.title.toLowerCase(),
				category: req.body.category,
				contact: req.body.contact
			};
			Tourist.findByIdAndUpdate(id, obj, (err, post) => {
				if (err || !post) {
					req.flash('warning', 'Something went wrong, please try again later');
					res.redirect('/tourist-attraction/' + id);
				} else {
					req.flash('success', 'You have successfully updated the post');
					return res.redirect('/tourist-attraction/' + id);
				}
			});
		}
	}
);

//delete
//cascade delete post and comment associated with it
router.delete('/tourist-attraction/:id', middleware.checkPostTouristOwnership, (req, res) => {
	let id = req.params.id;
	Tourist.findById(id, (err, foundPost) => {
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
			return res.redirect('/tourist-attraction');
		}
	});
});

module.exports = router;
