const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  URL			= require('url'),
	  ft_util		= require('./includes/ft_util.js'),
	  app 			= express(),
	  os			= require('os'),
	  dbc			= require('./model/sql_connect.js'),
	  email			= require('./includes/mail_client.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session[0];
	let sql,
		values = [];

	if (!ft_util.isobject(sess))
		res.redirect('/..');
	
	// if (sess.gender === 'M')
	// {
		if (sess.preferences === 'B')
		{
			sql = `SELECT * FROM users WHERE gender = 'F' AND (preferences = '${sess.gender}' OR preferences = 'B')`;
			dbc.query(sql, (err, result) => {
				if (err) throw err;
				values = result;
				sql = `SELECT * FROM users WHERE gender = 'M' AND (preferences = '${sess.gender}' OR preferences = 'B')`;

				dbc.query(sql, (err, result) => {
					if (err) throw err;
					dbc.query(sql, (err, result) => {
						if (err) throw err;
						res.render('matcha.pug', {
							title: 'Find your match',
							users: result.concat(values)
						});
					});
				});
			});
		}
		else if (sess.preferences === 'F')
			sql = `SELECT * FROM users WHERE gender = 'F' AND (preferences = '${sess.gender}' OR preferences = 'B')`;
		else
			sql = `SELECT * FROM users WHERE gender = 'M' AND (preferences = '${sess.gender}' OR preferences = 'B')`;
		dbc.query(sql, (err, result) => {
			if (err) throw err;
			dbc.query(sql, (err, result) => {
				if (err) throw err;
				res.render('matcha.pug', {
					title: 'Find your match',
					users: result.concat(values)
				});
			});
		});
});