const express 		= require('express'),
	  session	    = require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  bcrypt		= require('bcryptjs'),
	  moment        = require('moment'),
	  os			= require('os'),
	  util			= require('util'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	let   sql = "SELECT * from images WHERE user_id = ?",
		views,
		images;

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
		if (err) {throw err}
		images = result;
		sql = "SELECT id FROM views WHERE user_id = ?";
		dbc.query(sql, [sess.id], (err, result) => {
			if (err) {throw err}
			views = result.length;
			sql = "SELECT * from user_tags WHERE user_id = ?";
			dbc.query(sql, [sess.id], (err, result) => {
				if (err) {throw err}
				ft_util.getTagNames(dbc, result).then((tags) => {
					console.log("Result of tags is --> " + tags);
					if (ft_util.VERBOSE) {
						console.log(util.inspect({
							username: sess.username,
							sex: sess.gender,
							email: sess.email,
							dob: sess.DOB.slice(0, 10),
							first_name: sess.first_name,
							last_name: sess.last_name,
							preference: sess.preferences,
							biography: sess.biography,
							rating: sess.rating,
							images: images,
							tags: tags,
							viewcount: views
						}));
					}
					res.render('user.pug', {
						title: 'Your profile!',
						notifications: req.session.notifications,
						chats: req.session.chats,
						user: {
							username: sess.username,
							sex: sess.gender,
							email: sess.email,
							dob: sess.DOB.slice(0, 10),
							first_name: sess.first_name,
							last_name: sess.last_name,
							preference: sess.preferences,
							biography: sess.biography,
							rating: sess.rating,
							images: images,
							tags: tags,
							viewcount: views
						}
					});
				});
			});
		});
	});
}).post('/:key.:val.:val2?', (req, res) => {
	const sess = req.session.user,
	      key = req.params.key.trim(),
	      val = decodeURIComponent(req.params.val);
	let sql,
	    json = `{"key": "${ft_util.escapeStr(key)}", "value": "${ft_util.escapeStr(val)}", `;

	res.writeHead(200, {"Content-Type": "text/plain"});	//Allows us to respond to the client
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' || val.length === 0) {
		res.end(json + '"result": "Failed"}');
        	return;
	}
		
	if (ft_util.VERBOSE) {
		console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
	}

  	switch(key) {	//Ajax request will accept these keys only
		case 'interest':
			ft_util.valueExists(dbc, 'tags', 'name', val).then((result) => {
				if (result.length > 0) {
					sql = "INSERT INTO user_tags (user_id, tag_id) VALUES (?)";
					dbc.query(sql, [[sess.id, result[0].id]], (err, result) => {
						if (err) {throw err}
						res.end(json + '"result": "Success"}');
					});
				} else {
					sql = "INSERT INTO tags (name) VALUES (?)";
					dbc.query(sql, [[val.toLocaleLowerCase()]], (err, result) => {
						if (err) {throw err}
						sql = "INSERT INTO user_tags (user_id, tag_id) VALUES (?)";
						dbc.query(sql, [[sess.id, result.insertId]], (err, result) => {
							if (err) {throw err}
							res.end(json + '"result": "Success"}');
						});
					});
				}
			}).catch((err) => {res.end(json + '"result": "Failed"}')});
			return;
		case 'rm_interest':
			if (!isNaN(val)) {
				sql = "DELETE FROM user_tags WHERE user_id = ? AND tag_id = ?";
				dbc.query(sql, [sess.id, Number(val)], (err, result) => {
					if (err) {throw err}
					res.end(json + '"result": "Success"}');
				});
			} else res.end(json + '"result": "Failed"}');
			return;
		case 'username':
		case 'email':
			sql = "UPDATE users SET " + key + " = ? WHERE id = ?";
			if (key === 'email' && !ft_util.isemail(val)) {
				res.end(json + '"result": "Not email"}');
				return;
			}
			ft_util.valueExists(dbc, 'users', key, val).then((result) => {
				if (result.length > 0) {
					res.end(json + '"result": "Not unique"}');
				} else {
					dbc.query(sql, [val, sess.id], (err, result) => {
						if (err) {throw err}
						if (result.affectedRows === 1) {
							sess[key] = val;
							req.session.user = sess
							req.session.save((err) => {
								if (err) {throw err}
								res.end(json + '"result": "Success"}');
							});
						}
						else
							res.end(json + '"result": "Failed"}');
					});
				}
			}).catch((err) => {res.end(json + '"result": "Failed"}')});
			return;
		case 'resetpassword':
			sql = "UPDATE users SET password = ? WHERE id = ?";
			if (req.params.val2.length >= 5 /* !ft_util.passwdCheck(user.password) */) {
				if (bcrypt.compareSync(val, sess.password)) {
					let hash = bcrypt.hashSync(req.params.val2, ft_util.SALT); 
					dbc.query(sql, [hash, sess.id], (err, result) => {
						if (err) {throw err}
						if (result.affectedRows === 1) {
							sess['password'] = val;
							req.session.user = sess
							res.end(json + '"result": "Success"}');
						}
						else res.end(json + '"result": "Failed"}');
					});
				} else res.end(json + '"result": "Incorrect password"}');
			} else res.end(json + '"result": "Weak password"}');
			return;
		case 'fullname':
			sql = "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?";
			if (ft_util.isstring(req.params.val2))
				if (req.params.val2.length > 0)
					break;
		case 'DOB':
			if (!moment(val, "YYYY-MM-DD").isValid()) {
				res.end(json + '"result": "Invalid date"}');
				return;
			} else if (!moment(val).isBefore(moment().subtract(18, 'years'))) {
				res.end(json + '"result": "Too young"}');
				return;
			}
		case 'preferences':
		case 'gender':
			if (key === 'preferences' || key === 'gender')
				if (val !== 'M' && val !== 'F' && val !== 'B') {
					res.end(json + '"result": "Failed"}');
					return;
				}
		case 'biography':
			sql = "UPDATE users SET " + key + " = ? WHERE id = ?";
			break;
		default:
			res.end(json + '"result": "Failed"}');
	        return;
	}

	dbc.query(sql, (key !== 'fullname') ? [val, sess.id] : [val, req.param.val2, sess.id], (err, result) => {
		if (err) throw err;
		if (result.affectedRows === 1) {
			if (key === 'fullname') {
				sess['first_name'] = val;
				sess['last_name'] = req.param.val2
				req.session.user = sess
				req.session.save((err) => {
					if (err) {throw err}
					res.end(json + ' "value_2": "' + req.param.val2 + '", "result": "Success"}');
				});
			} else {
				sess[key] = val;
				req.session.user = sess
				req.session.save((err) => {
					if (err) {throw err}
					res.end(json + '"result": "Success"}');
				});
			}
		}
		else
			res.end(json + '"result": "Failed"}');
	});

});
