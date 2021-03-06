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
const MongoStore = require('connect-mongo')(session);
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitizeHtml = require('sanitize-html');
const cors = require('cors');

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
const Galleries = require('./models/gallery');
const Activities = require('./models/activity');

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
		name: 'kangenmantan',
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			autoRemove: 'interval',
			autoRemoveInterval: 10
		}),
		cookie: {
			httpOnly: true,
			secure: true,
			maxAge: 24 * 60 * 60 * 1000,
			sameSite: 'none'
		}
	})
);

//general app configuration
app.use(helmet());
app.use(compression());
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');
app.use(cookieParser('secret'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(cors());

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

// Forward all requests to HTTPS.
// enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see
// http://expressjs.com/api#req.secure). This allows us
// to know whether the request was via http or https.

app.use(function(req, res, next) {
	if (req.secure) {
		// request was via https, so do no special handling
		next();
	} else {
		if (req.headers.host == 'localhost:3000') {
			next();
		} else {
			// request was via http, so redirect to https
			res.redirect('https://' + req.headers.host + req.url);
		}
	}
});

//dos handling
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

//landing page
app.get('/', (req, res) => {
	Galleries.find().sort({ _id: -1 }).limit(15).exec((err, postsGalleries) => {
		let image;
		if (err) {
			req.flash('warning', 'Something went wrong, please try again later');
			res.redirect('/404');
		} else if (!postsGalleries.length) {
			image = null;
		} else {
			let mostLike = 0;
			for (let x = 0; x < postsGalleries.length; x++) {
				if (postsGalleries[x].like >= mostLike) {
					mostLike = postsGalleries[x].like;
					image = postsGalleries[x].image;
				}
			}
		}
		Activities.find().sort({ _id: -1 }).limit(3).exec((err, postsActivities) => {
			let activities;
			if (err) {
				req.flash('warning', 'Something went wrong, please try again later');
				res.redirect('/404');
			} else if (!postsActivities.length) {
				activities = null;
				res.render('index', { image: image, posts: null });
			} else {
				for (let x = 0; x < postsActivities.length; x++) {
					postsActivities[x].content = sanitizeHtml(postsActivities[x].content, {
						allowedTags: [],
						allowedAttributes: {}
					});
				}
				res.render('index', { image: image, posts: postsActivities });
			}
		});
	});
});

//documentation
app.get('/documentation', (req, res) => {
	res.render('documentation');
});

//404
app.get('*', (req, res) => {
	res.render('404');
});

//server listening config
app.listen(port, () => {
	console.log('server is listening on port ' + port);
});
