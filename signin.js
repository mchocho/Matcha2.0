const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  uuidv4 		= require('uuid/v4'),
	  session	    = require('express-session'),
	  ft_util		= require('./includes/ft_util.js');

let settings = {
	host		: 'localhost',
	user 		: 'root',
	//port		: '8080',
	port		: '3000',
	password	: '654321',
	// password: 'pw123456',
	database  : 'matcha',
	// socketPath: '/goinfre/mchocho/MAMP/mysql/tmp/mysql.sock',
	// socketPath: '/goinfre/rhobbs/Desktop/Server/mysql/tmp/mysql.sock'
	socketPath: '/goinfre/mchocho/documents/mamp/mysql/tmp/mysql.sock'
  }

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	res.render('signin.pug');
}).post('/', (req, res) => {
	const dbc 			= mysql.createConnection(settings);
	const user = req.body;
	let errors = ft_util.init_errors(),
		result = true;
	if (user.cupid === 'Submit') {
		if (user.username.length === 0) {
			result = false;
			errors['error_0'] = 'Enter a username';
		}
		if (user.password.length === 0) {
			result = false;
			errors['error_1'] = 'Enter your password';
		}
		if (result === true) {
			dbc.connect((err) => {
				let sql;
				if (err) {
				//TESTS
					console.error('error connecting: ' + err.stack);
					return;
				}
				sql = "SELECT * FROM users WHERE (password = ?) AND ((username = ?) OR (email = ?))";

				dbc.query(sql, [user.password, user.username, user.username], (err, result) => {
					if (err) throw err;
					if (result.length == 0)
						res.redirect('/signin');
					else
					{
						Object.assign(req.session, result);
						req.session.save(function(err) {
							res.redirect('/profile');
						});
					}
				});
			});
		} else {
			res.redirect('/signin');
		}
	}
});
