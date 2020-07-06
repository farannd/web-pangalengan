//package requirements
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

//general
const app = express();
const port = process.env.PORT || 3000;

//authentication configurration
app.use(
	session({
		secret: 'kepoin aja',
		resave: false,
		saveUninitialized: false
	})
);

//general app configuration
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');

//routes configuration
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.warning = req.flash('warning');
	next();
});

//landing page
app.get('/', (req, res) => {
	res.render('index');
});

//404
app.get('*', (req, res) => {
	res.render('404');
});

//server listening config
app.listen(port, () => {
	console.log('server is listening on port ' + port);
});
