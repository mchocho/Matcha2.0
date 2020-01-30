const express 		= require('express'),
	  session	    = require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  uuidv4 		= require('uuid/v4'),
	  nodemailer	= require('nodemailer'),
	  geo			= require('geolocation-utils'),
	  moment		= require('moment'),
	  os			= require('os'),
	  util			= require('util'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js'),
	  sql			= require('./model/sql_statements.js'),
	  email			= require('./includes/mail_client.js'),
	  msgTemplates 	= require('./includes/email_templates.js');

let router = express.Router();
module.exports = router;

router.get('/:id?', (req, res) => {
	const sess = req.session.user,
		  id = Number(req.params.id);
	let   location,
		  user;

	if (!ft_util.isobject(sess)) {
		res.redirect('/logout');
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
	else if (isNaN(id))
	{
		res.redirect('/matcha');
		return;
	}
	dbc.query("SELECT * from users WHERE id = ?", [id], (err, result) => {
		if (err) throw err;
		if (result.length === 0) {
				res.redirect('/matcha');
				return;
		}
		user = result[0];
		dbc.query("SELECT * FROM locations WHERE user_id = ?", [sess.id], (err, result) => {
			if (err) throw err;
			
			location = result[0];
			dbc.query("SELECT * from images WHERE user_id = ?", [id], (err, result) => {
				if (err) throw err;
				user.images = result;
				dbc.query("SELECT * from user_tags WHERE user_id = ?", [id], (err, result) => {
					if (err) throw err;
					for (let i = 0, n = result.length; i < n; i++) {
						dbc.query("SELECT name from tags WHERE id = ?", result[i].tag_id, (err, result) => {
							if (err) throw err;
							result[i]['name'] = result[0].name;
						});
					}
					dbc.query("SELECT * from locations WHERE user_id = ?", [id], (err, result) => {
						if (err) throw err;
						if (result.length === 0) {
							res.redirect('/matcha');
							return;
						}
						user['location'] = result[0];
						user['distance'] = geo.distanceTo({lat: location.lat, lon: location.lng}, {lat: result[0]['lat'], lon: result[0]['lng']}).toFixed(2);
						dbc.query("SELECT id FROM likes WHERE liker = ? AND liked = ?", [sess.id, id], (err, result) => {
							if (err) throw err;
							user['clientLikesUser'] = result.length > 0;
							dbc.query("SELECT id FROM likes WHERE liker = ? AND liked = ?", [id, sess.id], (err, result) => {
								if (err) throw err;
								user['userLikesClient'] = result.length > 0;
								dbc.query("INSERT INTO views (user_id, viewer) VALUES (?)", [[id, sess.id]], (err, result) => {
									if (err) throw err;
									sql = "INSERT INTO notifications (user_id, service_id, type) VALUES (?)";
									dbc.query(sql, [[id, result.insertId, 'views']], (err, result) => {
										if (err) throw err;
										user['age'] = moment(user.DOB).fromNow(true);
										if (ft_util.VERBOSE) {
											console.log('Profile object --> ' + util.inspect({
												title: user.username,
												notifications: req.session.notifications,
												chats: req.session.chats,
												user: user
											}));
										}
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
	});
}).post('/connect:profile?', (req, res) => {
	const sess = req.session.user,
	      profile = req.params.profile.replace(/\./g, '');
	let sql = "SELECT * FROM likes WHERE ((liker = ? AND liked = ?) OR (liker = ? AND liked = ?))",
	    userLikesYou = false,
	    youLikeUser = false,
	    json = `{"service": "connect", "profile": "${profile}", `;

	res.writeHead(200, {"Content-Type": "text/plain"});	//Allows us to respond to the client
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' || isNaN(profile)) {
		res.end(json + '"result": "Failed"}');
        return;
	}
		
	if (ft_util.VERBOSE) {
		console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
	}

	dbc.query(sql, [sess.id, profile, profile, sess.id, 'T'], (err, result) => {
		if (err) {throw err}
		for (let i = 0, n = result.length; i < n; i++) {
			if (result[i].liker === Number(profile))
				userLikesYou = true;
			if (result[i].liker === Number(sess.id))
				youLikeUser = true;
		}
		if (youLikeUser === true)
			sql = "DELETE FROM likes WHERE liker = ? AND liked = ?";
		else
			sql = "INSERT INTO likes (liker, liked) VALUES (?)";

		dbc.query(sql, (youLikeUser === true ) ? [sess.id, Number(profile)] : [[sess.id, Number(profile)]], (err, result) => {
			if (err) {throw err}
			if (result.affectedRows === 1) {
				sql = "INSERT INTO notifications (user_id, service_id, type) VALUES (?)";
				dbc.query(sql, [[Number(profile), result.insertId, (youLikeUser === true) ? 'unlike' : 'like']], (err, result) => {
					if (err) {throw err}
					res.end(json + `"result": "Success", "youLikeUser": "${!youLikeUser}", "userLikesYou": "${userLikesYou}" }`);
				});
			} else {
				res.end(json + '"result": "Failed"}');
			}
		});
	});
}).post('/report:profile?', (req, res) => {
	const sess = req.session.user,
	      profile = req.params.profile.replace(/\./g, ''),
	      token = uuidv4(),
	      url = "http://localhost:3000/verification/?key=" + token;
	let sql = "UPDATE users SET valid = 'F' WHERE id = ?",
	    json = `{"service": "report_profile", "profile": "${profile}", `;

	res.writeHead(200, {"Content-Type": "text/plain"});	//Allows us to respond to the client
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' || isNaN(profile)) {
		res.end(json + '"result": "Failed"}');
        return;
	}
	if (ft_util.VERBOSE) {
		console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
	}

	dbc.query(sql, [Number(profile)], (err, result) => {
		if (err) throw err;
		if (result.affectedRows === 1) {
			sql = "SELECT email FROM users WHERE id = ?";
			dbc.query(sql, [sess.id], (err, result) => {
				if (err) throw err;
				email.main(result.email, "Your profile has been reported | Cupid's Arrow", msgTemplates.report_account(url)).catch(console.error);
				res.end(json + '"result": "Success"}');
			});
		} else {
			res.end(json + '"result": "Failed"}');
		}
	});
});
