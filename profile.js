const express 		= require('express'),
	  session	    = require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  os			= require('os'),
	  util			= require('util'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js');

let router = express.Router();
module.exports = router;

router.get('/:id', (req, res) => {
	const sess = req.session[0],
		  id = req.params.id;
	let   sql = "SELECT * FROM locations WHERE id = ?",
		  location,
		  user;

	if (!ft_util.isobject(sess))
		res.redirect('/..');
	else if (sess.verified !== 'T')
		res.redirect('/verify_email');
	else if (sess.valid !== 'T')
		res.redirect('/reported_account');
	else if (!ft_util.isstring(id))
		res.redirect('/matcha');

	dbc.query(sql, [sess.id], (err, result) => {
		if (err) throw err;
		location = result[0];
		sql = "SELECT * from users WHERE user_id = ?";
		dbc.query(sql, [id], (err, result) => {
			if (err) throw err;
			if (result.length === 0)
				res.redirect('/matcha');
			user = result[0];
			sql = "SELECT * from images WHERE id = ?";
			dbc.query(sql, [id], (err, result) => {
				if (err) throw err;
				user.images = result;
				sql = "SELECT * from user_tags WHERE id = ?";
				dbc.query(sql, [id], (err, result) => {
					if (err) throw err;
					sql = "SELECT name from tags WHERE id = ?";
					for (let i = 0, n = result.length; i < n; i++) {
						dbc.query(sql, result[i].tag_id, (err, result) => {
							if (err) throw err;
							result[i].name = result[0].name;
						});
					}
					sql = "SELECT * from locations WHERE user_id = ?";
					dbc.query(sql, [id], (err, result) => {
						if (err) throw err;
						user.location = result[0];
						googleMapsClient.distanceMatrix({
							origins: [{lat: location.location[0], location.location[1]}],
							destinations: [{lat: result[0].location[0], lng: result[0].location[1]}],
							mode: 'walking',
							units: 'metric'
						}, (err, response) => {
							if (!err) {
								res.render('profile.pug', {
									title: user.username,
									notifications: req.session.notifications,
									chats: req.session.chats,
									user: user,
									location: response.rows[0].elements[0]
								});
						    } else if (err === 'timeout') {
						      // Handle timeout.
						    } else if (err.json) {
						      // Inspect err.status for more info.
						    } else {
						      // Handle network error.
						    }
						});
					});
				});
			});
		});
	});
});