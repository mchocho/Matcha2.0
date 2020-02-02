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
	dbc.query(sql.selUserById, [id], (err, result) => {
		if (err) throw err;
		if (result.length === 0) {
				res.redirect('/matcha');
				return;
		}
		user = result[0];
		dbc.query(sql.selUserLocation, [sess.id], (err, result) => {
			if (err) throw err;
			
			location = result[0];
			dbc.query(sql.selUserImages, [id], (err, result) => {
				if (err) throw err;
				user.images = result;
				dbc.query(sql.selUserTags, [id], (err, result) => {
					if (err) throw err;
					for (let i = 0, n = result.length; i < n; i++) {
						console.log("iteration #", i+1);
						dbc.query(sql.selTagName, result[i].tag_id, (err, t_name) => {
							if (err) throw err;
							console.log("Found tag: ", result[0].name);
							result[i]['name'] = t_name.name;
						});
					}
					dbc.query(sql.selUserLocation, [id], (err, result) => {
						if (err) throw err;
						if (result.length === 0) {
							res.redirect('/matcha');
							return;
						}
						user['location'] = result[0];
						user['distance'] = geo.distanceTo({lat: location.lat, lon: location.lng}, {lat: result[0]['lat'], lon: result[0]['lng']}).toFixed(2);
						
						dbc.query(sql.getConnectionStatus, [sess.id, id, id, sess.id], (err, result) => {
							if (err) {throw err}
							for (let i = 0, n = result.length; i < n; i++) {
								if (result[i].liker === id)
									user['userLikesClient'] = true;
								if (result[i].liker === Number(sess.id))
									user['clientLikesUser'] = true;
							}
							dbc.query(sql.insNewView, [[id, sess.id]], (err, result) => {
								if (err) throw err;
								dbc.query(sql.insNewNotification, [[id, result.insertId, 'views']], (err, result) => {
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
}).post('/connect:profile?', (req, res) => {
	const sess = req.session.user,
		  profile = Number(req.params.profile.replace(/\./g, '')),
		  xoxo = "&#9829";
	let ssql,
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

	dbc.query(sql.getConnectionStatus, [sess.id, profile, profile, sess.id, 'T'], (err, result) => {
		if (err) {throw err}
		for (let i = 0, n = result.length; i < n; i++) {
			if (result[i].liker === profile)
				userLikesYou = true;
			if (result[i].liker === Number(sess.id))
				youLikeUser = true;
		}

		dbc.query(
			(youLikeUser) ? sql.delLike : sql.insLike,
			(youLikeUser) ? [sess.id, profile] : [[sess.id, profile]],
			(err, result) => {
			if (err) {throw err}
			if (result.affectedRows === 1) {
				dbc.query(sql.insNewNotification, [[profile, result.insertId, (youLikeUser === true) ? 'unlike' : 'like']], (err, result) => {
					if (err) {throw err}
					//Email the user
					dbc.query(sql.selUserById, [profile], (err, result) => {
						if (err) {throw err}
						if (youLikeUser)
							email.main(result.email, `${result.username} unliked you... | Cupid's Arrow`, msgTemplates.userUnliked(result.username, sess.username)).catch(console.error);
						else if (userLikesYou)
							email.main(result.email, `${result.username} liked you back ${xoxo}${xoxo}${xoxo}! | Cupid's Arrow`, msgTemplates.connectedUserLiked(result.username, sess.username)).catch(console.error);
						else
							email.main(result.email, `${result.username} likes you! | Cupid's Arrow`, msgTemplates.userLiked(result.username, sess.username)).catch(console.error);
						ft_util.updateFameRating(dbc, profile).then(rating => {
							res.end(json + `"result": "Success", "youLikeUser": "${!youLikeUser}", "userLikesYou": "${userLikesYou}", "userRating": "${rating}"}`);
							return;
						});
					});
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
	let	  json = `{"service": "report_profile", "profile": "${profile}", `;

	res.writeHead(200, {"Content-Type": "text/plain"});	//Allows us to respond to the client
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' || isNaN(profile)) {
		res.end(json + '"result": "Failed"}');
        return;
	}
	if (ft_util.VERBOSE) {
		console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
	}

	dbc.query(sql.reportUser, [Number(profile)], (err, result) => {
		if (err) throw err;
		if (result.affectedRows === 1) {
			dbc.query(sql.selUserEmail, [Number(profile)], (err, result) => {
				if (err) throw err;
				email.main(result.email, "Your profile has been reported | Cupid's Arrow", msgTemplates.report_account(url)).catch(console.error);
				res.end(json + '"result": "Success"}');
			});
		} else {
			res.end(json + '"result": "Failed"}');
		}
	});
}).post('/block:profile?', (req, res) => {
	const sess = req.session.user,
	      profile = req.params.profile.replace(/\./g, ''),
	      values = [];
	let   json = `{"service": "block", "profile": "${profile}", `,
		  profileBlocked,
		  query;

	res.writeHead(200, {"Content-Type": "text/plain"});	//Allows us to respond to the client
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' || isNaN(profile)) {
		res.end(json + '"result": "Failed"}');
        return;
	}
	if (ft_util.VERBOSE) {
		console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
	}

	dbc.query(sql.selBlockedUser, [sess.id, Number(profile)], (err, result) => {
		if (err) {throw err}
		profileBlocked = result.length > 0;
		if (profileBlocked === true) {
			query = sql.delBlockedUser;
			values.push(sess.id, Number(profile));
		} else {
			query = sql.insBlockedUser;
			values.push([sess.id, Number(profile)]);
		}

		dbc.query(query, values, (err, result) => {
			if (err) {throw err}
			if (result.affectedRows === 1) {
				res.end(json + `"result": "Success", "profileBlocked"="${!profileBlocked}"}`);
			} else {
				res.end(json + `"result": "Failed", "profileBlocked"="${profileBlocked}"}`);
			}
		});

	});

});
