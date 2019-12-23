const express 		= require('express'),
	  session	    = require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  googleMapsClient = require('@google/maps').createClient({key: 'AIzaSyAZBn1NrjeC0gbFW4Fua4XEHudaTwvpy2Q'});
	  body_p		= require('body-parser'),
	  URL			= require('url'),
	  util 			= require('util'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js'),
	  email			= require('./includes/mail_client.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session[0];
	let sql = "SELECT blocked_user FROM blocked_accounts WHERE user_id = ?",
		blacklist,
		matches;

	if (!ft_util.isobject(sess))
		res.redirect('/..');
	else if (sess.verified !== 'T')
		res.redirect('/verify_email');
	else if (sess.valid !== 'T')
		res.redirect('/reported_account');
	dbc.query(sql, [sess.id], (err, result) => {
		if (err)
			throw err;
		blacklist = result;
		if (sess.preferences === 'B')
		{
			sql = "SELECT * FROM users WHERE gender = 'F' AND (preferences = ? OR preferences = 'B') AND verified = 'T' AND NOT id = ?";
			dbc.query(sql, [sess.gender, sess.id], (err, result) => {
				if (err) throw err;
				matches = result;
				sql = "SELECT * FROM users WHERE gender = 'M' AND (preferences = ? OR preferences = 'B') AND verified = 'T' AND NOT id = ?";
				dbc.query(sql, [sess.gender, sess.id], (err, result) => {
					if (err) throw err;
					ft_util.removeBlockedUsers(matches.concat(result), blacklist)
					.then(values => {
						//You should spice up the list befor this procedure
						sql ="SELECT name FROM images WHERE user_id = ? AND profile_pic = 'T'";
						for (let i = 0, n = values.length; i < n; i++) {
							dbc.query(sql, [values[i].id], (err, result) => {
								if (err) throw err;
								values[i].image = result[0];
								sql = "SELECT * FROM locations WHERE user_id = ?";
								dbc.query(sql, [values[i].id], (err, result) => {
									if (err) throw err;
									values[i].location = result[0];
								});
							});
						}
						res.render('matcha.pug', {
							title: "Find your match | Cupid's Arrow",
							users: values
						});
					}).catch(err => {
						throw err;
					});
				});
			});
		}
		else if (sess.preferences === 'F')
			sql = "SELECT * FROM users WHERE gender = 'F' AND (preferences = ? OR preferences = 'B') AND verified = 'T' AND NOT id = ?";
		else
			sql = "SELECT * FROM users WHERE gender = 'M' AND (preferences = ? OR preferences = 'B') AND verified = 'T' AND NOT id = ?";
		dbc.query(sql, [sess.gender, sess.id], (err, result) => {
			if (err) throw err;
			ft_util.removeBlockedUsers(matches.concat(result), blacklist)
			.then(values => {
				//You should spice up the list befor this procedure
				sql ="SELECT name FROM images WHERE user_id = ? AND profile_pic = 'T'";
				for (let i = 0, n = values.length; i < n; i++) {
					dbc.query(sql, [values[i].id], (err, result) => {
						if (err) throw err;
						values[i].image = result[0];
					});
				}
				res.render('matcha.pug', {
					title: "Find your match | Cupid's Arrow",
					users: values
				});
			}).catch(err => {
				throw err;
			});
		});
	});
});