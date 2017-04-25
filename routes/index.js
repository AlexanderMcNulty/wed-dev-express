var express = require('express');
var formidable = require('formidable');
var fortunes = require('./lib/fortune.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	  res.render('index', { title: fortunes.getFortune(), csrf:'CSRF toke goes here'
	//	console.log('fun stuff');
	 });
	 res.cookie('monster','nom nom', {signed:true});  	
	// res 
});

router.post('/process',function(req,res){
	console.log(req.body);
	var email = req.body.email;
	var name = req.body.name;
	req.session.name = name;
	console.log('\n\n'+ req.signedCookies.monster);
	res.redirect(303,'/results');
});

router.get('/contest/vacation-photo', function(req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{
		year: now.getFullYear(),month: now.getMont()
	});
});

router.post('/contest/vacation-photo', function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err) return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/results');
	});
});
router.get('/results', function(req, res, next){
	res.render('results', {content1: req.session.name});
	console.log(req.body);
});

module.exports = router;
