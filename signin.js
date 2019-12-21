const express 		= require('express'),
	  session	    = require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  util 			= require('util'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session[0];
	if (ft_util.isobject(sess))
		res.redirect('/matcha');
	res.render('signin.pug', {});
}).post('/', (req, res) => {
	const user = req.body;
	let errors = ft_util.init_errors(),
		result = true;
	if (user.cupid === 'Submit') {
		if (user.username.length === 0) {
			result = false;
			errors['error_0'] = 'Enter a username';
		}
		if (user.password.length === 0) {
			result = false;
			errors['error_1'] = 'Enter your password';
		}
		if (result === true) {
			const sql = "SELECT * FROM users WHERE (password = ? AND (username = ? OR email = ?))";

			dbc.query(sql, [user.password, user.username, user.username], (err, result) => {
				if (err) throw err;
				if (result.length == 0)
					res.redirect('/signin');
				else if (result.verified === 'F')
					res.redirect('/verify_email');
				else
				{
					Object.assign(req.session, result);
					req.session.save(function(err) {
						res.redirect('/matcha');
					});
				}
			});
		} else {
			res.render('/signin', {error_2: 'Sorry, your email or password was incorrect.'});
		}
	}
});
