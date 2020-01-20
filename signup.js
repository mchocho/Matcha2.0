const 	  express 		= require('express'),
      	  session	    	= require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  nodemailer 		= require('nodemailer'),
	  os			= require('os'),
	  util			= require('util'),
	  uuidv4 		= require('uuid/v4'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js'),
	  email			= require('./includes/mail_client.js'),
	  msgTemplates 	= require('./includes/email_templates.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session[0];
	if (ft_util.isobject(sess))
		res.redirect('/matcha');
	res.render('signup.pug', {errors: ft_util.init_errors()});
}).post('/', (req, res) => {
	const user = req.body,
		  token = uuidv4(),
		  url = "http://localhost:3000/verification/?key=" + token;
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
		if (user.preference !== 'Female' && user.preference !== 'Male') {
			user.preference = 'Both';
		}
		if (!moment(user.dob, "YYYY-MM-DD").isValid()) {
			result = false;
			errors['error_4'] = 'Enter your date of birth';
		}
		else if (!moment(user.dob).isBefore(moment().subtract(18, 'years'))) {
			result = false;
			errors['error_4'] = 'You must be 18 years or older to use this service';
		}
		if (!ft_util.isemail(user.email) ) {
			result = false;
			errors['error_5'] = 'Enter your email';
		}
		if (user.password.length < 5 && ft_util.hasuppercase(user.password) && ft_util.haslowercase(user.password) && ft_util.hasNumber(user.password) ) {
			result = false;
			errors['error_6'] = 'Provide a valid password of 5 characters or more, with special cases, uppercase and lowercase letters';
		} else if (user.password !== user.password_confirm) {
			result = false;
			errors['error_7'] = "The passwords you provided don't match."
		}

		if (result === true) {
			let sql = "SELECT id FROM users WHERE (username = ?)";
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
						res.render('signup', {errors: errors});
						return;
					}
	
					sql = "INSERT INTO users (username, first_name, last_name, gender, preferences, DOB, email, password) VALUES ?",
					values = [[ user.username, user.f_name, user.l_name, user.gender.charAt(0), user.preference.charAt(0), user.dob, user.email, user.password ]];
					dbc.query(sql, [values], (err, result) => {
						if (err) throw err;
						email.main(user.email, "Email verification | Cupid's Arrow", msgTemplates.verify_signup(url)).catch(console.error);
						sql = "INSERT INTO tokens (user_id, token, request) VALUES ?";
						values = [[result.insertId, token, 'registration']];
						dbc.query(sql, [values], (err, result) => {
							if (err) throw err;
							res.redirect('/verify_email');
						});
					});
				});
			});
		}
		else {
			res.render('signup', {errors: errors});
		}
	} else {
		errors['error_6'] = 'Something went wrong, please try again';
		res.redirect('signup', {errors: errors});
	}
});
