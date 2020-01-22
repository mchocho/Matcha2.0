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

router.get('/', (req, res) => {
	const sess = req.session.user;
	let   sql = "SELECT * from images WHERE user_id = ?",
		  images,
		  tags;

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
		images = result;
		sql = "SELECT * from user_tags WHERE user_id = ?";
		dbc.query(sql, [sess.id], (err, result) => {
			if (err) throw err;
			tags = result;
			sql = "SELECT name from tags WHERE id = ?";
			for (let i = 0, n = tags.length; i < n; i++) {
				dbc.query(sql, [tags[i].tag_id], (err, result) => {
					if (err) throw err;
					tags[i].tagname = result[0];
				});
			}
			//DEV
				console.log(util.inspect({
					username: sess.username,
					sex: sess.gender,
					first_name: sess.first_name,
					last_name: sess.last_name,
					preference: sess.preferences,
					biography: sess.biography,
					rating: sess.rating,
					images: images,
					tags: tags,
					viewcount: 3889
				}));
			//ENDOF DEV

			res.render('user.pug', {
				title: 'Your profile!',
				notifications: req.session.notifications,
				chats: req.session.chats,
				user: {
					username: sess.username,
					sex: sess.gender,
					first_name: sess.first_name,
					last_name: sess.last_name,
					preference: sess.preferences,
					biography: sess.biography,
					rating: sess.rating,
					images: images,
					tags: tags,
					viewcount: 3889
				}
			});
		});
	});
}).post('/:key.:val.:val2?', (req, res) => {
	const sess = req.session.user,
	      key = req.params.key.trim(),
	      val = req.params.val.trim();
	let sql,
	    json = `{"key": "${key}", "value": "${val}", `;

	res.writeHead(200, {"Content-Type": "text/plain"});
	
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' || val.length === 0) {
		res.end(json + '"result": "Failed"}');
        	return;
	}
		
	if (ft_util.VERBOSE) {
		console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
	}

  	switch(key) {
		case 'username':
		case 'gender':
		case 'preferences':
		case 'DOB':
		case 'email':
		case 'password':
		case 'bio':
			sql = "UPDATE users SET " + key + " = ? WHERE id = ?";
			break;
		case 'fullname':
			sql = "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?";
			if (ft_util.isstring(req.params.val2))
				if (req.params.val2.length > 0)
					break;
		default:
			res.end(json + '"result": "Failed"}');
	        return;
	}

	
	if (key === 'username' || key === 'email')
	{
		ft_util.valueExists(dbc, 'users', key, val).then((result) => {
			if (result) {
				res.end(json + '"result": "Not unique"}');
			} else {
				dbc.query(sql, [val, sess.id], (err, result) => {
					if (err) {throw err}
					if (result.affectedRows === 1)
						res.end(json + '"result": "Success"}');
					else
						res.end(json + '"result": "Failed"}');
				});
			}
		});
		return;
	}
	dbc.query(sql, (key !== 'fullname') ? [val, sess.id] : [val, req.param.val2, sess.id], (err, result) => {
		if (err) throw err;
		if (result.affectedRows === 1)
			res.end(json + '"result": "Success"}');
		else
			res.end(json + '"result": "Failed"}');
	});

});
