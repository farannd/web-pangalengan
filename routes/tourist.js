//package requirements
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/index');
const Tourist = require('../models/tourist');

//index
router.get('/tourist-attraction', (req, res) => {
	Tourist.find({}, (err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('tourist/index', { posts: null });
		} else if (!posts.length) {
			res.render('tourist/index', { posts: null });
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

			res.render('tourist/index', { posts: posts.reverse() });
		}
	});
});

//index for attraction only
router.get('/tourist-attraction/attraction', (req, res) => {
	Tourist.find({ category: 'attraction' }, (err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('tourist/attraction', { posts: null });
		} else if (!posts.length) {
			res.render('tourist/attraction', { posts: null });
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

			res.render('tourist/attraction', { posts: posts.reverse() });
		}
	});
});

//index for lodging only
router.get('/tourist-attraction/lodging', (req, res) => {
	Tourist.find({ category: 'lodging' }, (err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('tourist/lodging', { posts: null });
		} else if (!posts.length) {
			res.render('tourist/lodging', { posts: null });
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

			res.render('tourist/lodging', { posts: posts.reverse() });
		}
	});
});

//index for restaurant only
router.get('/tourist-attraction/restaurant', (req, res) => {
	Tourist.find({ category: 'restaurant' }, (err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('tourist/restaurant', { posts: null });
		} else if (!posts.length) {
			res.render('tourist/restaurant', { posts: null });
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

			res.render('tourist/restaurant', { posts: posts.reverse() });
		}
	});
});

//show new page
router.get('/tourist-attraction/new', (req, res) => {
	res.render('tourist/new');
});

//post new
router.post('/tourist-attraction', middleware.upload.array('image', 12), (req, res) => {
	if (req.files.length > 4) {
		req.flash('warning', 'Max input for images is 4');
		res.redirect('back');
	} else if (!req.body.title) {
		req.flash('warning', 'Please input a title');
		res.redirect('back');
	} else if (!req.body.content) {
		req.flash('warning', 'Please input a content');
		res.redirect('back');
	} else {
		let images = [];

		if (req.files.length == 0) {
			images = null;
		} else {
			for (let x = 0; x < req.files.length; x++) {
				images.push({ data: req.files[x].buffer, contentType: req.files[x].mimetype });
			}
		}
		console.log(images);
		let obj = {
			content: req.body.content,
			title: req.body.title.toLowerCase(),
			category: req.body.category,
			image: images ? [ ...images ] : null
		};
		console.log(obj);
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
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/tourist-attraction');
		} else {
			res.render('tourist/show', { post: post });
		}
	});
});

//show edit
router.get('/tourist-attraction/:id/edit', (req, res) => {
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
router.put('/tourist-attraction/:id', middleware.upload.array('image', 12), (req, res) => {
	let id = req.params.id;

	if (req.files.length > 4) {
		req.flash('warning', 'Max input for images is 4');
		res.redirect('back');
	} else if (!req.body.title) {
		req.flash('warning', 'Please input a title');
		res.redirect('back');
	} else if (!req.body.content) {
		req.flash('warning', 'Please input a content');
		res.redirect('back');
	} else if (req.files.length < 5 && req.files.length > 0) {
		let images = [];
		console.log(req.files.length);
		for (let x = 0; x < req.files.length; x++) {
			images.push({ data: req.files[x].buffer, contentType: req.files[x].mimetype });
		}
		console.log(images);
		let obj = {
			content: req.body.content,
			title: req.body.title.toLowerCase(),
			category: req.body.category,
			image: [ ...images ]
		};
		console.log(obj);
		Tourist.findByIdAndUpdate(id, obj, (err, post) => {
			if (err || !post) {
				req.flash('warning', 'Something went wrong, please try again later');
				res.redirect('/tourist-attraction');
			} else {
				req.flash('success', 'You have successfully updated the post');
				return res.redirect('/tourist-attraction/' + id);
			}
		});
	} else if (req.files.length == 0) {
		let obj = {
			content: req.body.content,
			title: req.body.title.toLowerCase(),
			category: req.body.category
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
});

//delete
//cascade delete post and comment associated with it
router.delete('/tourist-attraction/:id', (req, res) => {
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
