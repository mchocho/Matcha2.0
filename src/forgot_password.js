const express 	= require("express");
const uuidv4 	= require("uuid/v4");
const bcrypt	= require("bcryptjs");

const dbc		= require("../model/sql_connect.js");
const sql		= require("../model/sql_statements");
const email		= require("../includes/mail_client.js");
const msg 		= require("../includes/email_templates.js");
const ft_util	= require("../includes/ft_util.js");

let router = express.Router();

module.exports = router;

router.route("/")
.get((req, res) => {
	const sess = req.session.user;

	//User already logged in
	if (ft_util.isobject(sess))
	{
		res.redirect(redirect);
		return;
	}
	res.render("forgot_password");
}).post((req, res) => {
	let user;
	let errs 	= [];
	let token 	= uuidv4();
	let url 	= "http://localhost:3000/verification/" + token;
	let vals 	= [req.body.email];

	// We need to handle white space input and XSS
	if (!req.body.newPassword || !req.body.email || !req.body.confPassword) {
		errs.push("Fiilds can't be empty");
	}

	if (req.body.newPassword !== req.body.confPassword) {
		errs.push("Passwords don't match");
	} else if (ft_util.passwdCheck(req.body.newPassword) === false) {
		errs.push("Provide a valid password of 5 characters or more, with special cases, uppercase and lowercase letters");
	}

	if (errs.length > 0) {
		res.render("forgot_password", {messages: errs});
		return;
	}

	dbc.query(sql.selUserByEmail, vals, getUserId);

	function getUserId(err, result) {
		if (err) {throw err}
		user = result[0];
		if (!user) {
			// This is to throw off people trying to guess emails
			// ie, no email gets sent
			res.render("confirm_passwordchange");
			return;
		}
		checkOldTokens(user);
	}

	function checkOldTokens(user) {
		let vals = [user.id, "password_reset"];
		dbc.query(sql.delOldTokens, vals, (err, result) => {
			if (err) {throw err}
			createToken(user);
		});
	}

	function createToken(user) {
		let salt = 10;
		let hash = bcrypt.hashSync(req.body.newPassword, salt);
		let vals = [user.id, token, hash,"password_reset"];
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
		res.render("confirm_passwordchange");
	}
});