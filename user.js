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
	const sess = req.session[0];
	let   sql = "SELECT * from images WHERE user_id = ?",
		  images,
		  tags;

	if (!ft_util.isobject(sess))
		res.redirect('/..');
	else if (sess.verified !== 'T')
		res.redirect('/verify_email');
	else if (sess.valid !== 'T')
		res.redirect('/reported_account');

	dbc.query(sql, [sess.id], (err, result) => {
		if (err) throw err;
		images = result;
		for (let i = 0, n = images.length; i < 5; i++) {
			if (!ft_util.isobject(image[i]))
				images[i] = {
					name = 'images/placeholder.png';
				}
		}
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
});