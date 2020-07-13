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
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/activity');
		} else {
			res.render('about/index', { post: post });
		}
	});
});

//show new
// router.get('/about-us/new', (req, res) => {
// 	res.render('about/new');
// });

//posting new
// router.post('/about-us', middleware.upload.single('image'), (req, res) => {
// 	if (!req.file) {
// 		req.flash('warning', 'Please upload an image');
// 		res.redirect('/about-us/new');
// 	} else if (!req.body.content) {
// 		req.flash('warning', 'Please input a content');
// 		res.redirect('/about-us/new');
// 	} else {
// 		let obj = {
// 			content: req.body.content,
// 			image: {
// 				data: req.file.buffer,
// 				contentType: req.file.mimetype
// 			}
// 		};
// 		Abouts.create(obj, (err, item) => {
// 			if (err) {
// 				req.flash('warning', 'Something went wrong, please try again later');
// 				res.redirect('/about-us');
// 			} else {
// 				req.flash('success', 'Success uploading a new post');
// 				res.redirect('/about-us');
// 			}
// 		});
// 	}
// });

//show edit
router.get('/about-us/edit', middleware.isAdminLoggedIn, (req, res) => {
	Abouts.find({}, (err, post) => {
		if (err || !post) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/about-us');
		} else {
			res.render('about/edit', { post: post });
		}
	});
});

//updating
router.put('/about-us/:id', [ middleware.upload.single('image'), middleware.isAdminLoggedIn ], (req, res) => {
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
			req.flash('warning', 'Something went wrong, please try again later');
			return res.redirect('/about-us');
		} else {
			req.flash('success', 'You successfully update the post');
			return res.redirect('/about-us');
		}
	});
});

module.exports = router;
