//package requirements
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const favicon = require('serve-favicon');

//general confid
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

//routes requirement
const aboutRoutes = require('./routes/about');
const activityRoutes = require('./routes/activity');
const userRoutes = require('./routes/user');
const touristRoutes = require('./routes/tourist');
const galleryRoutes = require('./routes/gallery');

//model requirement
const User = require('./models/user');

//mongoose configuration
const url = process.env.DBURL;
mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});

//session authenticate
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
app.use(cookieParser('secret'));
app.use(favicon(__dirname + '/public/favicon.ico'));

//authenticate config
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//parameter yang dioper ke ejs
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.warning = req.flash('warning');
	next();
});

//routes config
app.use(aboutRoutes);
app.use(activityRoutes);
app.use(userRoutes);
app.use(touristRoutes);
app.use(galleryRoutes);

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
