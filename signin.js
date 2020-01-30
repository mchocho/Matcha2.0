const express 			= require('express'),
	  session	    	= require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  util 			= require('util'),
	  bcrypt		= require('bcryptjs'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js'),
	  sql			= require('./model/sql_statements.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	if (ft_util.isobject(sess)) { // Why the isObject func?
		res.redirect('/matcha'); // What does this actaully do
	}
	let message = req.flash('message');
	res.render('signin.pug', {message: message[0]});
}).post('/', (req, res) => {
	const user = req.body;
	let errors = ft_util.init_errors(),
		result = true
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
			let sql = "SELECT * FROM users WHERE (username = ? OR email = ?)";
			
			dbc.query(sql, [user.username, user.username], (err, result) => { // username twice?
				if (err) {throw err}
				if (result.length == 0) {
					res.render('signin', {error_2: 'Sorry, your email/username or password was incorrect.'});
					return;
				} 
				let passwdCheck = bcrypt.compareSync(user.password, result[0].password);
				if (!passwdCheck) {
					res.render('signin', {error_2: 'Sorry, your email/username or password was incorrect.'});
					return;
				}
				if (result[0].verified === 'F') {
					res.redirect('/verify_email');
					return;
				} else {
					const profile = result[0];
					req.session.user = profile;
					sql = "SELECT id FROM locations WHERE user_id = ?";
					if (ft_util.VERBOSE === true) {
						console.log("User login result:\n");
						console.log(util.inspect(req.session));
					}
					dbc.query(sql, [profile.id], (err, result) => {
						if (err) {throw err}
						ft_util.locateUser(ft_util.VERBOSE).then(userLocation => {
							const geo = JSON.parse(userLocation),
							      values = [];
							ft_util.updateUserLocation(dbc, geo, result.length === 0, ft_util.VERBOSE).then((result) => {
								req.session.save((err) => {
									if (err) {throw err}
									res.redirect('/matcha');
								});
							}).catch((err) => {
									if (ft_util.VERBOSE) {
										console.log("Failed to update user location to db");
									}
									req.session.save((err) => {
										if (err) {throw err}
										res.redirect('/matcha');
									});
							});
						}).catch((err) => {
							if (ft_util.VERBOSE === true) {
								console.log("Failed to retreive user location");
							}
							req.session.save((err) => {
								if (err) {throw err}
								res.redirect('/matcha');
							});
						});
					});
				}
			});
		} else {
			res.render('signin', {error_2: 'Sorry, your email or password was incorrect.'});
		}
	}
});
