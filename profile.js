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
		if (err) {throw err}
		if (result.length === 0) {
				res.redirect('/matcha');
				return;
		}
		user = result[0];
		dbc.query(sql.selUserLocation, [sess.id], (err, result) => {
			if (err) {throw err}
			
			location = result[0];
			dbc.query(sql.selUserImages, [id], (err, result) => {
				if (err) {throw err}
				user.images = result;
				dbc.query(sql.selUserTags, [id], (err, result) => {
					if (err) throw err;
					ft_util.getTagNames(dbc, result).then(nTags => {
						user.tags = nTags;
						ft_util.similarInterests(dbc, sess.id, id).then(tags => {
							for (let i = 0, n = tags.length; i < n; i++) {
								for (let j = 0, m = user.tags.length; j < m; j++) {
									if (tags[i] === user.tags[j].id) {
										user.tags[j]['similar'] = true;
									}
								}
							}

							dbc.query(sql.selUserLocation, [id], (err, result) => {
								if (err) throw err;
								if (result.length === 0) {
									res.redirect('/matcha');
									return;
								}
								user['location'] = result[0];
								user['distance'] = (geo.distanceTo({lat: location.lat, lon: location.lng}, {lat: result[0]['lat'], lon: result[0]['lng']}) / 1000 ).toFixed(0);
								
								dbc.query(sql.getConnectionStatus, [sess.id, id, id, sess.id], (err, result) => {
									if (err) {throw err}
									for (let i = 0, n = result.length; i < n; i++) {
										if (result[i].liker === id)
											user['userLikesClient'] = true;
										if (result[i].liker === Number(sess.id))
											user['clientLikesUser'] = true;
									}
									user['age'] = moment(user.DOB).fromNow(true);
									user['last_seen'] = moment(user['last_seen']).fromNow();

									dbc.query(sql.selBlockedUser, [sess.id, id], (err, result) => {
										Promise.all([
											ft_util.userNotificationStatus(dbc, sess.id),
											ft_util.getUserImages(dbc, sess.id)
										]).then((values) => {
											if (result === 0) {
												dbc.query(sql.insNewView, [[id, sess.id]], (err, result) => {
													if (err) throw err;
													dbc.query(sql.insNewNotification, [[id, result.insertId, 'views']], (err, result) => {
														if (err) throw err;
														if (ft_util.VERBOSE) {
															console.log('Notification status: ', values[0]);

															console.log('Profile object --> ' + util.inspect({
																title: user.username,
																notifications: values[0].notifications,
																chats: values[0].chats,
																profile_pic: values[1][0],
																user: user
															}));
														}
														res.render('profile.pug', {
															title: user.username,
															notifications: values[0].notifications,
															chats: values[0].chats,
															profile_pic: values[1][0],
															user: user
														});
													});
												});
											} else {
												if (ft_util.VERBOSE) {
													console.log('Profile object --> ' + util.inspect({
														title: user.username,
														notifications: values[0].notifications,
														chats: values[0].chats,
														profile_pic: values[1][0],
														user: user
													}));
												}
												res.render('profile.pug', {
													title: user.username,
													notifications: values[0].notifications,
													chats: values[0].chats,
													profile_pic: values[1][0],
													user: user
												});
											}
										}).catch(e => {
											throw (e)
										});
									});
								});
							});
						}).catch(e => {
							throw (e)
						});
					}).catch(e => {
						throw (e);
					});
				});
			});
		});
	});
}).post('/connect:profile?', (req, res) => {
	console.log("xxxxxxxxxxx " + JSON.stringify(req.params));
	const sess = req.session.user,
		  profile = Number(req.params.profile.replace(/\./g, ''));
	let rowExists,
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

	Promise.all([ft_util.getUserImages(dbc, sess.id), ft_util.getUserImages(dbc, profile)]).then((images) => {
		if (images[0].length === 0) {
			//you has no profile pic
			res.end(json + '"result": "No image client"}');
			return;
		} else if (images[1].length === 0) {
			//user has no profile pic
			res.end(json + '"result": "No image profile"}');
			return;
		}
		dbc.query(sql.getConnectionStatus, [sess.id, profile, profile, sess.id], (err, result) => {
			if (err) {throw err}
			for (let i = 0, n = result.length; i < n; i++) {
				if (result[i].liker === profile)
					userLikesYou = true;
				if (result[i].liker === Number(sess.id))
					youLikeUser = true;
			}

			dbc.query(sql.selBlockedUser, [sess.id, profile], (err, result) => {
				if (result.length === 0) {
					dbc.query(sql.checkUserLikeExists, [sess.id, profile], (err, result) => {
						if (err) {throw err}
						let notificationId;

						rowExists = result.length > 0;
						notificationId = (rowExists) ? result[0]['id'] : null;
						dbc.query(
							(youLikeUser) ? sql.unlikeUser : (rowExists) ? sql.likeUnlikedUser :sql.insLike,
							(youLikeUser) ? [sess.id, profile] : [[sess.id, profile]],
							(err, result) => {
							if (err) {throw err}
							if (result.affectedRows === 1) {
								dbc.query(sql.insNewNotification, [[profile,
									(youLikeUser && notificationId !== null) ? newId : result.insertId,
									(youLikeUser === true) ? 'unlike' : 'like']], (err, result) => {
									if (err) {throw err}
									//Email the user
									dbc.query(sql.selUserById, [profile], (err, result) => {
										if (err) {throw err}
										if (youLikeUser)
											email.main(result[0].email, `${sess.username} unliked you... | Cupid's Arrow`, msgTemplates.userUnliked(result[0].username, sess.username)).catch(console.error);
										else if (userLikesYou)
											email.main(result[0].email, `${sess.username} liked you back!❤️❤️❤️ | Cupid's Arrow`, msgTemplates.connectedUserLiked(result[0].username, sess.username)).catch(console.error);
										else
											email.main(result[0].email, `${sess.username} likes you! | Cupid's Arrow`, msgTemplates.userLiked(result[0].username, sess.username)).catch(console.error);
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
				} else {
					res.end(json + `"result": "Blocked", "youLikeUser": "${!youLikeUser}", "userLikesYou": "${userLikesYou}"}`);
				}
			});
		});
	}).catch(e => {throw e});
}).post('/report:profile?', (req, res) => {
	const sess = req.session.user,
	      profile = req.params.profile.replace(/\./g, ''),
	      token = uuidv4(),
	      url = "http://localhost:3000/api/verification/?key=" + token;
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

	dbc.query(sql.insNewToken, [[Number(profile), token, 'verification']], (err, result) => {
		if (err) throw err;
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
				res.end(json + `"result": "Success", "profileBlocked":"${!profileBlocked}"}`);
			} else {
				res.end(json + `"result": "Failed", "profileBlocked":"${profileBlocked}"}`);
			}
			/*if (profileBlocked === false) {
				dbc.query(sql.insNewNotification, [[Number(profile), result.insertId, 'block']], (err, result) => {
					if (err) {throw err}
					ft_util.getConnectionStatus(dbc, sess.id, profile).then((status) => {
						if (status.youLikeUser === true) {
							dbc.query(sql.unlikeUser, [sess.id, profile], (err, result) => {
								if (err) {throw err}
								return;
							});
						}
					});
				});
			}*/
		});
	});
	return;
}).post('/cconnect', (req, res) => {
	const user = req.session.user;
	const otherUserId = req.body.otherUser;
	let userHasImage = false;
	let otherUserHasImage = false;
	let jsonReturn = "";
	let userLikesYou = false;
	let youLikeUser = false;

	res.writeHead(200, {"Content-Type": "text/plain"});

	// Check if user is logged in
	if (!ft_util.isobject(user) || user.verified !== 'T' || user.valid !== 'T' ) {
		res.end('{"res":failed}');
		res.redirect('/logout');
		console.log("Profile cconnect logged you out");
    return;
	}

	checkUsersImages(user.id, otherUserId);

	// Check if both users have profile pics
	function checkUsersImages(userId, otherUserId) {
		dbc.query(sql.selUserImages, [[userId]], (err, result) => {
			if (err) {
				throw err;
			}
			if (result.length > 0) {
				userHasImage = true;
				dbc.query(sql.selUserImages, [[otherUserId]], (err, result) => {
					if (err) {
						throw err;
					}
					if (result.length > 0) {
						otherUserHasImage = true;
						jsonReturn = '{"res": success}';
						// res.end(jsonReturn);
						getUsersConnStatus();
					}
					else {
						res.end('{"res": failed, "reason": no images}');
						return ;
					}
				});
			} else {
				res.end('{"res": failed, "reason": no images}');
				return ;
			}
		});
	}

	// Get conn status
	function getUsersConnStatus() {
		dbc.query(sql.getConnectionStatus, [user.id, otherUserId, otherUserId, user.id], (err, result) => {
			if (err) {throw err}
			for (let i = 0; i < result.length; i++) {
				if (result[i].liker === otherUserId) {
					userLikesYou = true;
				}
				if (result[i].liker === user.id) {
					youLikeUser = true;
				}
			}
			checkBlockedStatus();
		});
	}

	// Check if user is blocked
	function checkBlockedStatus() {
		dbc.query(sql.selBlockedUser, [otherUserId, user.id], (err, result) => {
			if (err) {throw err}
			if (result.length > 0) {
				res.end('{"res": failed, "reason": user has blocked you}');
				return ;
			} else {
				// jsonReturn = '{"res": success, "reason": you are not blocked}';
				// res.end(jsonReturn);
				checkLikeStatus();
				return;
			}
		});
	}

	// Check like status
	function checkLikeStatus() {
		dbc.query(sql.selUserLikeStatus, [user.id, otherUserId], (err, result) => {
			if (err) {throw err}
			if (result.length == 0) {
				likeUser(false);
			} else if (result[0].unliked === 'T') {
				likeUser(true, result[0].id);
			} else if (result[0].unliked === 'F') {
				unlikeUser();
			}
			console.log(`You checked like status ${JSON.stringify(result)}`);
			// res.end(JSON.stringify(result));
			return ;
		});
	}

	// Like a user
	function likeUser(hasLikedBefore, likesRowId) {
		if (!hasLikedBefore) {
			dbc.query(sql.insLike, [[user.id, otherUserId]], (err, result) => {
				if (err) {throw err}
				console.log("Like inserted " + JSON.stringify(result));
				// res.end(JSON.stringify(result));
				createNotification(result.insertId);
				return ;
			});
		} else if (hasLikedBefore) {
			dbc.query(sql.likeUnlikedUser, [user.id, otherUserId], (err, result) => {
				if (err) {throw err}
				console.log("Like updated " + JSON.stringify(result));
				// res.end(JSON.stringify(result));
				createNotification(likesRowId);
				return ;
			});
		}
	}

	// Unlike a user
	function unlikeUser() {
		dbc.query(sql.unlikeUser, [user.id, otherUserId], (err, result) => {
			console.log("you unliked a user");
			jsonReturn = '{"res": success, "reason": you unliked a user}';
			// res.end(jsonReturn);
			updateFameRating(false);
			return ;
		});
	}

	// Only create a notification if other user was liked
	function createNotification(serviceId) {
		console.log(`SID ${serviceId}`);
		dbc.query(sql.insNewNotification, [[otherUserId, serviceId, 'like']], (err, result) => {
			// Due to the unique row index this will
			// throw an error for duplicate row entries
			// see line 220 of setup.sql
			if (err) {
				if (err.code === 'ER_DUP_ENTRY'){
					console.log("Dup row found");
					updateFameRating(true);
				}
				else {
					throw err;
				}
			} else {
				updateFameRating(true);
			}
			return;
		});
	}

	function updateFameRating(increaseRating) {
		dbc.query(sql.selUserRating, [otherUserId], (err, result) => {
			if (err) {throw err}
			console.log("eeet");
			let currentRating = Number(result[0].rating);
			let newRating = increaseRating ? currentRating + 1 : currentRating - 1 ; 
			res.end(`{"success": true, "rating": ${newRating}}`);
			return;
		});
	
	}
});