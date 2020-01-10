const 	  express 		= require('express'),
	  session	    	= require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  os			= require('os'),
	  util			= require('util'),
	  dbc			= require('./model/sql_connect.js'),
	  ft_util		= require('./includes/ft_util.js');

let router = express.Router();
module.exports = router;

router.all('/:redirectTo.:arg?', (req, res) => {
	const sess = req.session[0];
	let sql = "SELECT valid FROM users WHERE id = ?";
	
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
	dbc.query(sql, [sess.id], (err, result) => {
		if (err) throw err;
		if (result.valid === 'T') {
			res.render('account_reported');
			return;
		}
		sql = "SELECT id FROM notifications WHERE user_id = ? AND viewed = 'F' LIMIT 1";
		dbc.query(sql, [sess.id], (err, result) => {
			if (err) throw err;
			req.session.notifications = result.length > 0;
			sql = "SELECT id FROM chat_notifications WHERE user_id = ? AND viewed = 'F' LIMIT 1";
			dbc.query(sql, [sess.id], (err, result) => {
				if (err) throw err;
				req.session.chats = result.length > 0;
				if (req.method != 'GET')
					switch (req.params.redirectTo) {
						case 'chats':
							res.redirect('/chats');
							break;
						case 'profile':
							if (ft_util.isstring(req.params.arg)) {
								res.redirect('/profile/' + req.params.arg);
								break;
							}
						default:
							res.redirect('/matcha');
					}
			});
		});
	});
}).get('/notifications', (req, res) => {
	const sess = req.session[0];
	let sql = "SELECT * FROM notifications WHERE user_id = ?",
	    notifications;
	dbc.query(sql, [sess.id], (err, result) => {
    		if (err) throw err;
			notifications = result;
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
					    				notifications: result
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
    				notifications: result
    			});
    });
});
