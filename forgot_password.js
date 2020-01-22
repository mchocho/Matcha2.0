const express 		= require('express'),
	  	dbc			= require('./model/sql_connect.js'),
		sql			= require('./model/sql_statements'),
		uuidv4 		= require('uuid/v4'),
		email		= require('./includes/mail_client.js'),
		msg 		= require('./includes/email_templates.js');

let router = express.Router();
module.exports = router;

router.route('/')
.get((req, res) => {
	res.render('forgot_password');
}).post((req, res) => {
	let user;
	let token = uuidv4();
	let url = "http://localhost:3000/verification/" + token;
	let vals = [req.body.email];
	dbc.query(sql.selUserByEmail, vals, getUserId);

	function getUserId(err, result) {
		if (err) {throw err}
		user = result[0];
		createToken(user);
	}

	function createToken(user) {
		let vals = [user.id, token, 'password_reset'];
		dbc.query(sql.insNewToken, vals, emailResetLink);
	}

	function emailResetLink(err, result) {
		if (err) {throw err}
		if (result.affectedRows !== 1) {
			console.log("Something went wrong in forgot_password");
		}
		email.main(user.email, "Password Reset Confirmation", msg.passwordReset(url))
		.catch(console.error);
	}
});