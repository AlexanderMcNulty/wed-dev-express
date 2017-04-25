var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var express_session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Vacation = require('./models/vacation.js');
var index = require('./routes/index');
var users = require('./routes/users');
var credentials = require('./credentials.js');
var VacationInSeasonListener = require('./models/vacationInSeasonListener.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(credentials.cookieSecret));
app.use(express_session());
app.use(express.static(path.join(__dirname, 'public')));

var opts = {
	server: {
		socketOptions: { keepAlive: 1}
	}
};
switch(app.get('env')){
	case 'development':
		mongoose.connect('mongodb://127.0.0.1:27017/test', opts);
		break;
	case 'production':
		mongoose.connect('mongodb://127.0.0.1:27017/test', opts);
		break;
	default:
		throw new Error('Unknown execution environment: ' + appget('env'));
}
Vacation.find(function(err, vacations){
	if(vacations.length)return;
	new Vacation({
		name: 'Hood River Day Trip',
		slug: 'hood-river-dat-trip',
		category: 'Day Trip',
		sku: 'HR199',
		description: 'Spend a day sailing on the Columbia and ' + 'enjoying craft beers in Hood River!',
		priceInCents: 9995,
		tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
		inSeason: true,
		maximumGuest: 16,
		available:true,
		packagesSold: 0,
	}).save();	
	new Vacation({
		name: 'do fun stuff',
		slug: 'hat-trip',
		category: 'Trip',
		sku: 'HR555',
		description: 'Get drunk on craft beers in Hood River!',
		priceInCents: 9995,
		tags: ['Get wasted', 'sailing', 'windsurfing', 'breweries'],
		inSeason: true,
		maximumGuest: 6,
		available:true,
		packagesSold: 0,
	}).save();
	new Vacation({
		name: 'South of No Orgy',
		slug: 'rip',
		category: 'rip',
		sku: 'HR666',
		description: 'beers in Hood River!',
		priceInCents: 9995,
		tags: ['Get wasted', 'orgy', 'sailing', 'windsurfing', 'breweries'],
		inSeason: false,
		maximumGuest: 6,
		available:true,
		packagesSold: 0,
		notes: 'oh yeah here is a note',
	}).save();
});
	
	

app.use('/', index);
app.use('/users', users);
app.get('/vacations',function(req,res){
	Vacation.find({ available:true }, function(err, vacations){
		var context = {
			vacations: vacations.map(function(vacation){
				return { 
					sku: vacation.sku,	
					name: vacation.name,
					description: vacation.description,
					price: vacation.getDisplayPrice(),
					inSeason: vacation.inSeason,
				}
			})
		};
		res.render('vacations',context);
	});
});
app.get('/notify-me-when-in-season', function(req,res){
        res.render('notify-me-when-in-season', {sku: req.query.sku});
});
app.post('/notify-me-when-in-season', function(req,res){
        VacationInSeasonListener.update(
                {email: req.body.email},
                {$push: {skus: req.body.sku} },
                {upsert: true },
		function(err){
			if(err){
				console.error(err.stack);
				return res.redirect(303, '/vacations');
			};
			return res.redirect(303, '/vacations');
		}
        );
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
