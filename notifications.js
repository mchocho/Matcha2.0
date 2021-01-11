const express 		= require('express'),
	  session	    = require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  os			= require('os'),
	  util			= require('util'),
	  dbc			= require('./model/sql_connect.js'),
	  sql			= require('./model/sql_statements.js'),
	  ft_util		= require('./includes/ft_util.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	let notifications;
	// let sql = "SELECT * FROM notifications WHERE user_id = ?";
		//notifications;
		

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

	
	Promise.all(
		[ft_util.userNotificationStatus(dbc, Number(sess.id)),
		ft_util.getUserImages(dbc, sess.id),
		ft_util.getUserNotifications(dbc, sess.id)
		]
	).then((values) => {
		if (ft_util.VERBOSE) {
			console.log("Here's our notification values: ", values);
			for (let i = 0; i < values[1].length; i++)
				console.log('Heres the notification sources:', values[1][i].source);
		}

		dbc.query(sql.updateUserNotifications, [sess.id], (err, result) => {
			if (err) {throw err}
			res.render('notifications.pug', {
				title: "Your Notifications | Cupid's Arrow",
				notifications: values[0].notifications,
				chats: values[0].chats,
				profile_pic: values[1][0],
				userNotifications: values[2].reverse()
			});
		});
	}).catch(e => {
		throw (e);
	});

	/*dbc.query(sql.selUserNotifications, [sess.id], (err, result) => {
    		if (err) throw err;
			notifications = result;
			if (ft_util.VERBOSE) {
				console.log("Notification object:\n ", notifications);
			}

			if (notifications.length > 0) {
    			for (let i = 0, n = notifications.length; i < n; i++) {
    				let type = notifications[i].type;

	    			notifications[i].connection = false;
	    			if (type === 'like')
						sql = "SELECT * FROM likes WHERE id = ?";
	    			else if (type === 'unlike')
	    				sql = "SELECT * FROM likes WHERE id = ? AND unliked = 'T'";
	    			else if (type === 'views')
	    				sql = "SELECT viewer FROM views WHERE id = ?";
	    			dbc.query(sql, [notifications[i].service_id], (err, result) => {
	    				if (err) throw err;
	    				notifications[i].service = result[0];
						sql = "SELECT * FROM users WHERE id = ?";
	    				dbc.query(sql, [result[0].service.liker], (err, result) => {
	    					if (err) throw err;
	    					notifications[i].service.liker = result[0];
	    					sql = "SELECT id FROM likes WHERE liked = ? AND liker = ?";
	    					dbc.query(sql, [result[0].liker, sess.id], (err, result) => {
	    						if (err) throw err;
								notifications[i].connection = result.length > 0;
								if (i === n - 1)
									res.render('notifications.pug', {
    									title: "Your Notifications | Cupid's Arrow",
    									notifications: req.session.notifications,
										chats: req.session.chats,
					    				notifications: notifications
					    			});
	    					});
	    				});
	    			});
				}
			} else
    			res.render('notifications.pug', {
    				title: "Your Notifications | Cupid's Arrow",
    				notifications: req.session.notifications,
					chats: req.session.chats,
    				notifications: notifications
    			});
    });*/
});
