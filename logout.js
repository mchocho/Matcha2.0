const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  URL			= require('url'),
	  session 		= require('express-session'),
	  uuidv4 		= require('uuid/v4'),
	  ft_util		= require('./includes/ft_util.js'),
	  app 			= express(),
	  nodemailer 	= require('nodemailer'),
	  os			= require('os');


let router = express.Router();
module.exports = router;
app.use(session({secret: uuidv4(), cookie: {}, resave: false, saveUninitialized: true}));


router.get('/', (req, res) => {
    
    req.session.destroy(function() {
        res.redirect('/signin');
    });
});