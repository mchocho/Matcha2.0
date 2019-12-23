const express 		= require('express'),
	  session	    = require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  ft_util		= require('./includes/ft_util.js'),
	  os			= require('os'),
	  util			= require('util');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session[0];

	if (!ft_util.isobject(sess))
		res.redirect('/..');
	else if (sess.verified !== 'T')
		res.redirect('/verify_email');
	else if (sess.valid !== 'T')
		res.redirect('/reported_account');
	res.render('user.pug', {
		title: 'Your profile!',
		notifications: req.session.notifications,
		chats: req.session.chats,
		user: {
			username: sess.username,
			sex: sess.gender,
			first_name: sess.first_name,
			last_name: sess.last_name,
			preference: sess.preferences,
			biography: sess.biography,
			rating: sess.rating,
			viewcount: 3889,
			picture: 'https://www.biography.com/.image/t_share/MTE4MDAzNDEwNzQzMTY2NDc4/will-smith-9542165-1-402.jpg'
		}
	});
});