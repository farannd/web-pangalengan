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

module.exports = router;
