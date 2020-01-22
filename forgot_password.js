const express 		= require('express'),
	  	dbc			= require('./model/sql_connect.js'),
		sql			= require('./model/sql_statements'),
		uuidv4 		= require('uuid/v4'),
		email		= require('./includes/mail_client.js');

let router = express.Router();
module.exports = router;

router.route('/')
.get((req, res) => {
	res.render('forgot_password');
}).post((req, res) => {
	let vals = [req.body.email];
	dbc.query(sql.selUserIdByEmail, vals, getUserId);

	function getUserId(err, result) {
		if (err) {throw err}
		let userId = result[0].id;
		createToken(userId);
	}

	function createToken(userId) {
		let token = uuidv4();
		let vals = [userId, token, 'password_reset'];
		dbc.query(sql.insNewToken, vals, emailResetLink);
	}

	function emailResetLink(err, result) {
		if (err) {throw err}
		console.log(result);
		res.send("things where done");
	}
});