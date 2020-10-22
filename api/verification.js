const express 			= require("express");
const dbc				= require("../model/sql_connect.js");
const email				= require("../includes/mail_client.js");
const msgTemplates 		= require("../includes/email_templates.js");
const sql 				= require("../model/sql_statements");

const router 			= express.Router();

module.exports 			= router;

router.get("/:id", (req, res) =>
{
	let 	tokenRow;
	const 	token 		= [req.params.id]
	const 	sess 		= req.session.user;

	dbc.query(sql.findByToken, token, getUserIdFromToken);

	function getUserIdFromToken(err, result)
	{
		if (err) {throw err}

		if (result.length === 0)
		{
			res.redirect("/"); // This failure needs to be handled better
			return;
		}
		tokenRow = result[0];
		
		let updateValues = ['T', tokenRow.user_id];

		if (tokenRow.request == "registration")
		{
			dbc.query(sql.setUserVerification, updateValues, delTokenRow)
		}
		else if (tokenRow.request == "password_reset")
		{
			updateValues = [tokenRow.new_password, tokenRow.user_id];
			dbc.query(sql.updatePasswd, updateValues, delTokenRow);
		}
	}

	function delTokenRow(err, result)
	{
		if (err) {throw err}

		let delValues = [tokenRow.id];

		if (result.affectedRows === 0)
		{
			console.log("There was an error in verification api, handle this error");
			return;
		}
		
		dbc.query(sql.delTokenRow, delValues, returnSuccess)	
	}

	function returnSuccess(err, result) {
		if (err) {throw err}

		let message;

		if (result.affectedRows === 0)
		{
			console.log("There was an error in verification api, handle this error");
			return;
		}
		
		if (tokenRow.request == "registration")
		{
			message = "You have successfully verified your account, please signin.";
		}
		else if (tokenRow.request == "password_reset")
		{
			message = "You have successfully changed your password, please signin";
		}
		req.flash("message", message);
		res.redirect("/");
	}
});

		  
