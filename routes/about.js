//package requirement
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/index');

//model
const Abouts = require('../models/about');

//Routes
//index
router.get('/about-us', (req, res) => {
	Abouts.find({}, (err, post) => {
		if (err || !post.length) {
			//!harus di update
			res.redirect('/');
		} else {
			res.render('about/index', { post: post });
		}
	});
});

//show new
router.get('/about-us/new', (req, res) => {
	res.render('about/new');
});

//posting new
router.post('/about-us', middleware.upload.single('image'), (req, res) => {
	let obj = {
		content: req.body.content,
		image: {
			data: req.file.buffer,
			contentType: req.file.mimetype
		}
	};
	Abouts.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/about-us');
		}
	});
});

//show edit
router.get('/about-us/edit', (req, res) => {
	Abouts.find({}, (err, post) => {
		if (err || !post) {
			res.redirect('*');
		} else {
			res.render('about/edit', { post: post });
		}
	});
});

//updating
router.put('/about-us/:id', middleware.upload.single('image'), (req, res) => {
	let id = req.params.id;
	let obj = {};
	if (req.file) {
		obj = {
			content: req.body.content,
			image: {
				data: req.file.buffer,
				contentType: req.file.mimetype
			}
		};
	} else {
		obj = {
			content: req.body.content
		};
	}
	Abouts.findByIdAndUpdate(id, obj, (err, update) => {
		if (err) {
			return res.redirect('/about-us');
		} else {
			req.flash('success', 'Update success');
			return res.redirect('/about-us');
		}
	});
});

module.exports = router;
