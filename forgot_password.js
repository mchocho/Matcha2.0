const express 		= require('express'),
	  	dbc			= require('./model/sql_connect.js'),
		sql			= require('./model/sql_statements'),
		uuidv4 		= require('uuid/v4'),
		email		= require('./includes/mail_client.js'),
		msg 		= require('./includes/email_templates.js'),
		bcrypt		= require('bcrypt'),
		ft_util		= require('./includes/ft_util.js'),
		_			= require('lodash');

let router = express.Router();
module.exports = router;

router.route('/')
.get((req, res) => {
	// TODO Stop a signed in user from seeing this page
	res.render('forgot_password');
}).post((req, res) => {
	let errs = [];
	let user;
	let token = uuidv4();
	let url = "http://localhost:3000/verification/" + token;
	let vals = [req.body.email];

	if (!req.body.newPassword || !req.body.email || !req.body.confPassword) {
		errs.push("Feilds can't be empty");
	}
	
	if (req.body.newPassword !== req.body.confPassword) {
		errs.push("Passwords don't match");
	} else if (ft_util.passwdCheck(req.body.newPassword) === false) {
		errs.push("Password must be 6 characters or more and not a number");
	}

	if (errs.length > 0) {
		res.render('forgot_password', {messages: errs});
		return;
	}

	dbc.query(sql.selUserByEmail, vals, getUserId);

	function getUserId(err, result) {
		if (err) {throw err}
		user = result[0];
		if (!user) {
			// This is to throw off people trying to guess emails
			// ie, no email gets sent
			res.render('confirm_passwordchange');
			return;
		}
		createToken(user);
	}

	function createToken(user) {
		let salt = 10;
		let hash = bcrypt.hashSync(req.body.newPassword, salt);
		let vals = [user.id, token, hash,'password_reset'];
		dbc.query(sql.insNewPwToken, vals, emailResetLink);
	}

	function emailResetLink(err, result) {
		if (err) {throw err}
		if (result.affectedRows !== 1) {
			console.log("Something went wrong in forgot_password");
			return;
		}
		email.main(user.email, "Password Reset Confirmation", msg.passwordReset(url))
		.catch(console.error);
		res.render('confirm_passwordchange');
	}
});