const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  URL			= require('url'),
	  ft_util		= require('./includes/ft_util.js'),
	  app 			= express(),
	  PORT 			= process.env.PORT || 5000,
	  nodemailer 	= require('nodemailer'),
	  os			= require('os'),
	  email			= require('./includes/mail_client.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	res.render('profile.pug', {
		title: 'The Fresh Prince\'s profile!',
		user: {
			username: 'Your matches',
			sex: 'M',
			first_name: 'Will',
			last_name: 'Smith',
			preference: 'F',
			biography: "Today is a new day!",
			rating: 8,
			viewcount: 3889,
			picture: 'https://www.biography.com/.image/t_share/MTE4MDAzNDEwNzQzMTY2NDc4/will-smith-9542165-1-402.jpg'
		}
	});
});