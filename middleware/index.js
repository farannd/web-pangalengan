const multer = require('multer');

const middleware = {
	upload: multer({
		limits: { fileSize: 5000000 },
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
				//allowed file extensions
				return cb(new Error('please upload png,jpeg or jpg'));
			}
			cb(undefined, true);
		}
	})
};

module.exports = middleware;
