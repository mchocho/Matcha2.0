const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  URL			= require('url'),
	  ft_util		= require('./includes/ft_util.js'),
	  nodemailer 	= require('nodemailer'),
	  os			= require('os'),
	  email			= require('./includes/mail_client.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	res.render('signup.pug', {errors: ft_util.init_errors()});
}).post('/', (req, res) => {
	const dbc 			= mysql.createConnection({
			  host		: 'localhost',
			  user 		: 'root',
			  //port		: '8080',
			  port		: '3000',
			  //password	: '654321',
			  password: 'pw123456',
			  database  : 'matcha',
			  //socketPath: '/goinfre/mchocho/MAMP/mysql/tmp/mysql.sock',
			  socketPath: '/goinfre/rhobbs/Desktop/Server/mysql/tmp/mysql.sock'
			  //socketPath: '/goinfre/mchocho/documents/mamp/mysql/tmp/mysql.sock'
			});
	const user = req.body;
	const token = os.hostname + "/signup/verify_email/:" + 'Some Unique Key';
	let errors = ft_util.init_errors(),
		result = true;
	const msg = `<h1>Verify Your Email</h1>
		<p>Please confirm that you want to use this email address for your Cupid's Arrow account. Once it's done you will be able to start using this service.</p>
		<button>
			<a href="${token}" target="_blank">Verify my email</a>
		</button>
		<br />
		Or copy and paste the link below into the address bar
		<br />
		<br />
		<p align="center">&copy Cupid's Arrow | 2019</p>`;

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
			dbc.connect((err) => {
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
				dbc.query(sql, [user.username], (err, result) => {
					if (err) throw err;
					if (result.length !== 0) {
						result = false;
						errors['error_0'] = 'Username already exists';
					}

					sql = "SELECT id FROM users WHERE (email = ?)";
					dbc.query(sql, [user.email], (err, result) => {
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
						dbc.query(sql,
							[values],
							function (err, result) {
							if (err) throw err;
							console.log("Number of records inserted: " + result.affectedRows);
							email.main(user.email, "Email verification | Cupid's Arrow", msg);
						});
					});
				});
			});
		}
		else
			// res.redirect('/');
			console.log('Error object --> ' + util.inspect(errors));
	} else {
		console.log("Something went wrong, please try again");
		res.redirect('/');
	}
});