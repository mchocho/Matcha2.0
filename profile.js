const express 		= require('express'),
	  session	    = require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  geo			= require('geolocation-utils'),
	  os			= require('os'),
	  util			= require('util'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js');

let router = express.Router();
module.exports = router;

router.get('/:id?', (req, res) => {
	const sess = req.session[0],
		  id = Number(req.params.id);
	let   sql = "SELECT * from users WHERE id = ?",
		  location,
		  user;

	if (!ft_util.isobject(sess) || isNaN(id)) {
		res.redirect('/..');
		return;
	}
	else if (sess.verified !== 'T') {
		res.redirect('/verify_email');
		return;
	}
	else if (sess.valid !== 'T') {
		res.redirect('/reported_account');
		return;
	}

	dbc.query(sql, [id], (err, result) => {
		if (err) throw err;
		if (result.length === 0) {
				res.redirect('/matcha');
				return;
		}
		user = result[0];
		sql = "SELECT * FROM locations WHERE user_id = ?";
		dbc.query(sql, [sess.id], (err, result) => {
			if (err) throw err;
			
			location = result[0];
			sql = "SELECT * from images WHERE user_id = ?";
			dbc.query(sql, [id], (err, result) => {
				if (err) throw err;
				user.images = result;
				sql = "SELECT * from user_tags WHERE user_id = ?";
				dbc.query(sql, [id], (err, result) => {
					if (err) throw err;
					sql = "SELECT name from tags WHERE id = ?";
					for (let i = 0, n = result.length; i < n; i++) {
						dbc.query(sql, result[i].tag_id, (err, result) => {
							if (err) throw err;
							result[i]['name'] = result[0].name;
						});
					}
					sql = "SELECT * from locations WHERE user_id = ?";
					dbc.query(sql, [id], (err, result) => {
						if (err) throw err;
						if (result.length === 0) {
								res.redirect('/matcha');
								return;
						}
						user['location'] = result[0];
						user['distance'] = geo.distanceTo({lat: location.lat, lon: location.lng}, {lat: result[0]['lat'], lon: result[0]['lng']}).toFixed(2);
						sql = "INSERT INTO views (user_id, viewer) VALUES (?)";
						dbc.query(sql, [[id, sess.id]], (err, result) => {
							if (err) throw err;
							sql = "INSERT INTO notifications (user_id, service_id, type) VALUES (?)";
							dbc.query(sql, [[id, result.insertId, 'views']], (err, result) => {
								if (err) throw err;
								sql = "SELECT *id FROM "


								//TEST
								console.log("Hello profile.js");

								console.log('Profile object --> ' + util.inspect({
									title: user.username,
									notifications: req.session.notifications,
									chats: req.session.chats,
									user: user
								}));

								// res.redirect('/matcha');
								//ENDOF TEST


								res.render('profile.pug', {
									title: user.username,
									notifications: req.session.notifications,
									chats: req.session.chats,
									user: user
								});
							});
						});
					});
				});
			});
		});
	});
});