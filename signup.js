const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  URL			= require('url'),
	  ft_util		= require('./includes/ft_util.js'),
	  nodemailer 	= require('nodemailer'),
	  os			= require('os'),
	  uuidv4 		= require('uuid/v4'),
	  conn			= require('./model/sql_connect.js');
	  msgs			= require('./includes/mail_client.js');
	  mailTemplates = require('./includes/email_templates.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session[0];
	if (ft_util.isobject(sess))
		res.redirect('/matcha');
	res.render('signup.pug', {errors: ft_util.init_errors()});
}).post('/', (req, res) => {
	/*const dbc 			= mysql.createConnection({
			  host		: 'localhost',
			  user 		: 'root',
			  //port		: '8080',
			  port		: '3000',
			  //password	: '654321',
			  // password: 'pw123456',
			  database  : 'matcha',
			  //socketPath: '/goinfre/mchocho/MAMP/mysql/tmp/mysql.sock',
			  socketPath: '/var/run/mysql.sock'
			  //socketPath: '/goinfre/mchocho/documents/mamp/mysql/tmp/mysql.sock'
			}),*/
	const user = req.body,
		  token = uuidv4(),
		  url = os.hostname + "/signup/verify_email/?key=" + token;
	let   errors = ft_util.init_errors(),
		  result = true;
	

	if (user.cupid === 'Submit') {
		if (user.username === undefined || user.username.length === 0) {
			result = false;
			errors['error_0'] = 'Enter a username';
		}
		if (user.f_name === undefined || user.f_name.length === 0) {
			result = false;
			errors['error_1'] = 'Enter your first name';
		}
		if (user.l_name === undefined || user.l_name.length === 0) {
			result = false;
			errors['error_2'] = 'Enter your last name';
		}
		if (user.gender !== 'Female' && user.gender !== 'Male') {
			result = false;
			errors['error_3'] = 'Specify your gender';
		}
		if (user.preference !== 'Female' || user.preference !== 'Male')
			user.preference = 'Both';
		if (!moment(user.dob, "YYYY-MM-DD").isValid()) {
			result = false;
			errors['error_5'] = 'Enter your date of birth';
		}
		if (!ft_util.isemail(user.email) ) {
			result = false;
			errors['error_4'] = 'Enter your email';
		}
		if (user.password === undefined || user.password.length < 5) {
			result = false;
			errors['error_6'] = 'Provide a valid password of 5 characters or more';
		} else if (user.password !== user.password_confirm) {
			result = false;
			errors['error_7'] = 'The passwords you provided don\'t match.'
		}

		if (result === true) {
			conn.dbc.connect((err) => {
				let sql;
				if (err) {
				//TESTS
					console.error('error connecting: ' + err.stack);
					return;
				}
					console.log('connected as id ' + dbc.threadId);
				console.log('Great you\'re good to go!');
				//ENDOF TESTS


				sql = "SELECT id FROM users WHERE (username = ?)";
				conn.dbc.query(sql, [user.username], (err, result) => {
					if (err) throw err;
					if (result.length !== 0) {
						result = false;
						errors['error_0'] = 'Username already exists';
					}

					sql = "SELECT id FROM users WHERE (email = ?)";
					conn.dbc.query(sql, [user.email], (err, result) => {
						if (err) throw err;
						if (result.length !== 0) {
							result = false;
							errors['error_1'] = 'Email already exists';
						}

						if (result === false) {
							console.log(errors);
							return;
							//We should redirect user back to registration page instead
						}
		
						sql = "INSERT INTO users (username, first_name, last_name, gender, preferences, DOB, email, password, online, verified, biography) VALUES ?;",
						values = [
							  [
								user.username, 
								user.f_name, 
								user.l_name, 
								user.gender.charAt(0), 
								user.preference.charAt(0), 
								user.dob, 
								user.email, 
								user.password, 
								'F', 'F', ''
							  ]
						];
						conn.dbc.query(sql,
							[values],
							function (err, result) {
							if (err) throw err;
							// console.log("Number of records inserted: " + result.affectedRows);
							email.main(user.email, "Email verification | Cupid's Arrow", msgs.verify_signup(url));
							sql = "INSERT INTO tokens (user_id, token, request) VALUES ?";
							values = [
								[
									result.insertId,
									token,
									'registration'
								]
							];
							conn.dbc.query(sql,
								[values],
								function (err, result) {
									if (err) throw err;
									res.redirect('/verify_email');
								});
						});
					});
				});
			});
		}
		else {
			console.log('Error object --> ' + util.inspect(errors));
			res.redirect('/');
		}
	} else {
		console.log("Something went wrong, please try again");
		res.redirect('/');
	}
});