const express = require('express');
const router = express.Router();
const middleware = require('../middleware/index');
const Galleries = require('../models/gallery');

//index
router.get('/gallery', (req, res) => {
	let page = 1;
	let skip = 0;
	let limit = 6;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
		skip = (page - 1) * limit;
	}

	Galleries.find().sort({ _id: -1 }).limit(limit).skip(skip).exec((err, posts) => {
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.render('gallery/index', { posts: null });
		} else if (!posts.length) {
			res.render('gallery/index', { posts: null, page: null });
		} else {
			res.render('gallery/index', { posts: posts, page: page });
		}
	});
});

//show new
router.get('/gallery/new', middleware.isLoggedIn, (req, res) => {
	res.render('gallery/new');
});

//post new
router.post('/gallery', [ middleware.upload.array('image', 12), middleware.isLoggedIn ], (req, res) => {
	if (req.files.length > 2) {
		req.flash('warning', 'Max input for images is 2');
		res.redirect('/gallery/new');
	} else if (!req.body.content) {
		req.flash('warning', 'Please input a content');
		res.redirect('/gallery/new');
	} else if (!req.files) {
		req.flash('warning', 'Please input images');
		res.redirect('/gallery/new');
	} else {
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
			res.redirect('/gallery/new');
		} else {
			let images = [];
			for (let x = 0; x < req.files.length; x++) {
				images.push({ data: req.files[x].buffer, contentType: req.files[x].mimetype });
			}

			let obj = {
				content: req.body.content,
				like: 0,
				image: [ ...images ],
				author: {
					id: req.user.id,
					username: req.user.username
				}
			};

			Galleries.create(obj, (err, doc) => {
				if (err || !doc) {
					req.flash('warning', 'Something went wrong, please try again later');
					res.redirect('/gallery');
				} else {
					req.flash('success', 'You have successfully uploaded the post');
					res.redirect('/gallery');
				}
			});
		}
	}
});

//show individual post
router.get('/gallery/:id', (req, res) => {
	let id = req.params.id;
	Galleries.findById(id, (err, post) => {
		if (err || !post) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/gallery');
		} else {
			res.render('gallery/show', { post: post });
		}
	});
});

//post likes
router.post('/gallery/:id/like', (req, res) => {
	let id = req.params.id;
	Galleries.findById(id, (err, doc) => {
		if (err) {
			console.log(err);
		} else {
			doc.like = doc.like + 1;
			doc.save((err, result) => {
				if (err) {
					console.log(err);
				} else {
					res.redirect('/gallery/' + id);
				}
			});
		}
	});
});

//show edit
router.get('/gallery/:id/edit', middleware.checkPostGalleryOwnership, (req, res) => {
	let id = req.params.id;
	Galleries.findById(id, (err, post) => {
		if (err || !post) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/gallery');
		} else {
			res.render('gallery/edit', { post: post });
		}
	});
});

//update post
router.put('/gallery/:id', middleware.checkPostGalleryOwnership, (req, res) => {
	let id = req.params.id;
	if (!req.body.content) {
		req.flash('warning', 'Please input a content');
		res.redirect('/gallery/' + id + '/edit');
	} else {
		let obj = {
			content: req.body.content
		};

		Galleries.findByIdAndUpdate(id, obj, (err, doc) => {
			if (err || !doc) {
				req.flash('warning', 'Something went wrong, please try again later');
				res.redirect('/gallery/' + id);
			} else {
				req.flash('success', 'You have successfully updated the post');
				res.redirect('/gallery/' + id);
			}
		});
	}
});

//delete
//cascade delete post and comment associated with it
router.delete('/gallery/:id', middleware.checkPostGalleryOwnership, (req, res) => {
	let id = req.params.id;
	Galleries.findById(id, (err, foundPost) => {
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
			return res.redirect('/gallery');
		}
	});
});

module.exports = router;
