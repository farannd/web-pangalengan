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
			res.render('activity/index', { posts: posts });
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
		title: req.body.title,
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
			title: req.body.title,
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
			title: req.body.title,
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

module.exports = router;
