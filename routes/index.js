var express = require('express');
var fortunes = require('./lib/fortune.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: fortunes.getFortune() });
  
});

module.exports = router;
