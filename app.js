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
const url =
	'mongodb://admin:Hip9C1EbVFJ1KZJO@cluster0-shard-00-00.sofu5.mongodb.net:27017,cluster0-shard-00-01.sofu5.mongodb.net:27017,cluster0-shard-00-02.sofu5.mongodb.net:27017/pangalengan?ssl=true&replicaSet=atlas-13vzyg-shard-0&authSource=admin&retryWrites=true&w=majority';

//routes requirement
const aboutRoutes = require('./routes/about');
const activityRoutes = require('./routes/activity');

//model requirement

//mongoose configuration
mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});

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
app.use(aboutRoutes);
app.use(activityRoutes);

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
