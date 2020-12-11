const express 		= require("express");
const moment		= require("moment");
const uuidv4 		= require("uuid/v4");
const bcrypt		= require("bcryptjs");

const ft_util		= require("../includes/ft_util.js");
const dbc			= require("../model/sql_connect.js");
const sql 			= require("../model/sql_statements.js");
const email			= require("../includes/mail_client.js");
const msgTemplates 	= require("../includes/email_templates.js");

let router 			= express.Router();
module.exports = router;

router.get("/", (req, res) => {
	const sess = req.session.user;

	//User is logged in
	if (ft_util.isobject(sess))
	{
		res.redirect("/matcha");
		return;
	}

	res.render("signup.pug", {errors: []});
}).post("/", (req, res) => {
	const user 		= req.body;
	const sess 		= req.session.user;
	const errors 	= [];

	let valid 		= true;

	//User is logged in
	if (ft_util.isobject(sess))
	{
		res.redirect("/matcha");
		return;
	}

	if (user.cupid !== "Submit")
	{
		errors[6] = "Something went wrong, please try again";
		res.redirect("signup", {errors});
		return;
	}

	//Validate username
	if (!ft_util.isSetStr(user.username))
	{
		valid = false;
		errors[0] = "Enter a username";
	}

	//Validate first name
	if (!ft_util.isSetStr(user.f_name))
	{
		valid = false;
		errors[1] = "Enter your first name";
	}

	//Validate last name
	if (!ft_util.isSetStr(user.l_name))
	{
		valid = false;
		errors[2] = "Enter your last name";
	}

	//Validate gender
	if (user.gender !== "Female" && user.gender !== "Male")
	{
		valid = false;
		errors[3] = "Specify your gender";
	}

	//Validate preferences
	if (user.preference !== "Female" && user.preference !== "Male")
		user.preference = "Both";

	//Validate date of birth
	if (!moment(user.dob, "YYYY-MM-DD").isValid())
	{
		valid = false;
		errors[4] = "Enter your date of birth";
	}
	else if (!moment(user.dob).isBefore(moment().subtract(18, "years"))) {
		valid = false;
		errors[4] = "You must be 18 years or older to use this service";
	}

	//Validate email
	if (!ft_util.isEmail(user.email))
	{
		valid = false;
		errors[5] = "Enter your email";
	}

	//Validate password
	if (!ft_util.passwdCheck(user.password))
	{
		valid = false;
		errors[6] = "Provide a valid password of 5 characters or more, with special cases, uppercase and lowercase letters";
	}
	else if (user.password !== user.password_confirm)
	{
		valid = false;
		errors[7] = "The passwords you provided don't match.";
	}

	if (!valid)
	{
		res.render("signup", {errors});
		return;
	}
	validateAuthId();

	function validateAuthId()
	{
		const errors 	= [];
		let valid 		= true;

		//Check if username exists
		dbc.query(sql.selCheckUsernameExists, [user.username], (err, result) => {
			if (err) {throw err}

			if (result.length !== 0)
			{
				valid = false;
				errors[0] = "Username already exists";
			}

			dbc.query(sql.selCheckUserEmailExists, [user.email], (err, result) => {
				if (err) {throw err}

				if (result.length !== 0)
				{
					valid = false;
					errors[1] = "Email already exists";
				}

				if (valid === false)
				{
					res.render("signup", {errors});
					return;
				}
				signUpUser();
			});
		});
	}

	function signUpUser()
	{
		const hash 		= bcrypt.hashSync(user.password, ft_util.SALT);
		const token 	= uuidv4();
		const url 		= "http://localhost:3000/verification/" + token;
		const insertValues = [
			user.username,
			user.f_name,
			user.l_name,
			user.gender.charAt(0),			//M or F
			user.preference.charAt(0),		//M or F or B
			user.dob,
			user.email,
			hash
		];

		dbc.query(sql.insNewUser, [insertValues], (err, result) => {
			if (err) {throw err}

			const emailAddress 	= user.email;
			const emailTitle 	= "Email verification | Cupid's Arrow";
			const msg 			= msgTemplates.verify_signup(url);

			//Send verification email to user
			email.main(emailAddress, emailTitle, msg).catch(console.error); // What do these emailmethods do?
			saveVerificationToken(result.insertId, token);
		});
	}

	function saveVerificationToken(userId, token)
	{
		const insertValues = [userId, token, "registration"];

		dbc.query(sql.insNewToken, [insertValues], (err, result) => {
			if (err) {throw err}

			saveLocationAndRedirect(userId);
		});
	}

	function saveLocationAndRedirect(userId)
	{
		(async () => {
			try {
				//Get user position
				const userLocation 	= await ft_util.locateUser();

				// console.log("There's a bug somewhere in this function. So I just commented out the tracking process!");
				// console.trace();
				const geo = JSON.parse(userLocation);	//There's a parsing issue
				console.log(geo);

				//Create new row
				const userIdExists = false;

				console.log('Updating user location');
				//Sends new location to db
				const update = await ft_util.updateUserLocation(dbc, geo, userIdExists, userId);

				res.redirect("/verify_email");
			}
			catch(e) {
				if (ft_util.VERBOSE)
					console.log("Failed to update user location to db. Message: ", e);
				res.redirect("/verify_email");
			}
		})();
	}
});
