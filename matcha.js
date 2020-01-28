const express 		= require('express'),
	  geo			= require('geolocation-utils'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	let sql = "SELECT * FROM locations WHERE user_id = ?",
		blacklist,
		location,
		matches;

	if (!ft_util.isobject(sess)) {
		res.redirect('/logout');
		return;
	}
	else if (sess.verified !== 'T') {
		req.session.destroy(function(err) {
			if (err) {throw err}
			res.redirect('/verify_email');
		});
		return;
	}
	else if (sess.valid !== 'T') {
		req.session.destroy(function(err) {
			if (err) {throw err}
			res.redirect('/reported_account');
		});
		return;
	}
	dbc.query(sql, [sess.id], (err, result) => {
		if (err) throw err;
		if (result.length === 0) {
			res.redirect('/user');
			return
		}
		location = result[0];
		sql = "SELECT blocked_user FROM blocked_accounts WHERE user_id = ?";
		dbc.query(sql, [sess.id], (err, result) => {
			blacklist = result;
			if (sess.preferences === 'M')
				sql = "SELECT * FROM users WHERE gender = 'M' AND (preferences = ? OR preferences = 'B') AND verified = 'T' AND NOT id = ?";
			else if (sess.preferences === 'F')
				sql = "SELECT * FROM users WHERE gender = 'F' AND (preferences = ? OR preferences = 'B') AND verified = 'T' AND NOT id = ?";
			else
				sql = "SELECT * FROM users WHERE (preferences = ? OR preferences = 'B') AND verified = 'T' AND NOT id = ?";
			dbc.query(sql, [sess.gender, sess.id], (err, result) => {
				if (err) throw err;
				ft_util.removeBlockedUsers(result, blacklist)
				.then(values => {
					if (values.length > 0) {
						for (let i = 0, n = values.length; i < n; i++) {
							sql ="SELECT name FROM images WHERE user_id = ? AND profile_pic = 'T'";
							values[i]['url'] = '/profile/' + values[i].id;
							dbc.query(sql, [values[i].id], (err, result) => {
								if (err) throw err;
								values[i].images = result;
								sql = "SELECT * FROM locations WHERE user_id = ?";
								dbc.query(sql, [values[i].id], (err, result) => {
									if (err) throw err;
									if (result.length === 0) {
										values.splice(i, 1);
										i--;
										return;
									}
									values[i]['distance'] = geo.distanceTo({lat: location.lat, lon: location.lng}, {lat: result[0]['lat'], lon: result[0]['lng']}).toFixed(2);
									//💩💩💩
									if (i === n - 1) {
										console.log("Hello render");
										res.render('matcha.pug', {
											title: "Find your match | Cupid's Arrow",
											users: values
										});
									}
								});
							});
						}
					} else {
						res.render('matcha.pug', {
							title: "Find your match | Cupid's Arrow",
							users: []
						}); 
					}
				}).catch(err => {
					throw err;
				});
			});
		});
	});
});
