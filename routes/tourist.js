//package requirements
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/index');
const Tourist = require('../models/tourist');

//index
router.get('/tourist-attraction', (req, res) => {
	Tourist.find({}, (err, posts) => {
		if (err) {
			console.log(err);
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
			if (err) {
				console.log(err);
			} else {
				req.flash('success', 'Success');
				res.redirect('/tourist-attraction');
			}
		});
	}
});

//index for attraction only
router.get('/tourist-attraction/attraction', (req, res) => {
	res.send('attraction');
});

//index for lodging only
router.get('/tourist-attraction/lodging', (req, res) => {
	res.send('lodging');
});

//index for restaurant only
router.get('/tourist-attraction/restaurant', (req, res) => {
	res.send('restaurant');
});

//show individual post
router.get('/tourist-attraction/:id', (req, res) => {
	let id = req.params.id;
	Tourist.findById(id, (err, post) => {
		if (err) {
			req.flash('error', "There's no such post");
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
		if (err) {
			console.log(err);
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
			if (err) {
				console.log(err);
			} else {
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
			if (err) {
				console.log(err);
			} else {
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
			console.log(err);
			return res.redirect('/activity');
		} else {
			// let commentLength = foundPost.comment.length;
			// for (let i = 0; i < commentLength; i++) {
			// 	Comment.findByIdAndDelete(foundPost.comment[i]._id, (err, result) => {
			// 		if (err) console.log(err.message);
			// 	});
			// }
			foundPost.deleteOne();
			return res.redirect('/tourist-attraction');
		}
	});
});

module.exports = router;
