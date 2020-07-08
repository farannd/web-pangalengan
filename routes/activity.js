//package requirements
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/index');

//models
const Activities = require('../models/activity');

//Routes
//index
router.get('/activity', (req, res) => {
	Activities.find({}, (err, posts) => {
		if (err || !posts.length) {
			//!harus di update
			res.redirect('/');
		} else {
			num1 = Math.floor(Math.random() * posts.length);
			num2 = Math.floor(Math.random() * posts.length);
			// run this loop until numberOne is different than numberThree
			if (posts.length > 1) {
				do {
					num1 = Math.floor(Math.random() * posts.length);
				} while (num1 === num2);
			}
			res.render('activity/index', {
				posts: posts.reverse(),
				random1: posts[num1],
				random2: posts[num2]
			});
		}
	});
});

//show new
router.get('/activity/new', (req, res) => {
	res.render('activity/new');
});

//post new
router.post('/activity', middleware.upload.single('image'), (req, res) => {
	let obj = {
		content: req.body.content,
		title: req.body.title.toLowerCase(),
		video: req.body.video ? req.body.video : 'false',
		file: req.body.file ? req.body.file : 'false',
		image: {
			data: req.file.buffer,
			contentType: req.file.mimetype
		}
	};
	Activities.create(obj, (err, post) => {
		if (err) {
			console.log(err);
		} else {
			console.log('saved to database');
			res.redirect('/activity');
		}
	});
});

//show individual post
router.get('/activity/:id', (req, res) => {
	let id = req.params.id;
	Activities.findById(id, (err, post) => {
		if (err) {
			console.log(err);
		} else {
			res.render('activity/show', { post: post });
		}
	});
});

//show edit
router.get('/activity/:id/edit', (req, res) => {
	let id = req.params.id;
	Activities.findById(id, (err, post) => {
		if (err) {
			console.log(err);
		} else {
			res.render('activity/edit', { post: post });
		}
	});
});

//update post activity
router.put('/activity/:id', middleware.upload.single('image'), (req, res) => {
	let id = req.params.id;
	let obj = {};
	if (req.file) {
		obj = {
			content: req.body.content,
			title: req.body.title.toLowerCase(),
			video: req.body.video ? req.body.video : 'false',
			file: req.body.file ? req.body.file : 'false',
			image: {
				data: req.file.buffer,
				contentType: req.file.mimetype
			}
		};
	} else {
		obj = {
			content: req.body.content,
			title: req.body.title.toLowerCase(),
			video: req.body.video ? req.body.video : 'false',
			file: req.body.file ? req.body.file : 'false'
		};
	}
	Activities.findByIdAndUpdate(id, obj, (err, post) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/activity/' + id);
		}
	});
});

//cascade delete post and comment associated with it
router.delete('/activity/:id', (req, res) => {
	let id = req.params.id;
	Activities.findById(id, (err, foundPost) => {
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
			//!harus di update
			console.log(err);
		} else if (!postsSearch.length) {
			res.render('activity/search', { search: req.params.search, posts: null });
		} else {
			res.render('activity/search', { posts: postsSearch.reverse(), search: req.params.search });
		}
	});
});

module.exports = router;
