const express 		= require("express");
const session    	= require("express-session");
const uuidv4 		= require("uuid/v4");
const moment		= require("moment");
const nodemailer	= require("nodemailer");

const dbc			= require("./model/sql_connect.js");
const ft_util		= require("./includes/ft_util.js");
const sql			= require("./model/sql_statements");
const email			= require("./includes/mail_client.js");
const msgTemplates 	= require("./includes/email_templates.js");

let router 			= express.Router();
module.exports 		= router;

router.get("/:id", (req, res) =>
{
	const sess 	= req.session.user;
	const id 	= Number(req.params.id);
	const token = uuidv4();
	const url 	= "http://localhost:3000/api/verification/?key=" + token;

	if (!ft_util.isobject(sess))
	{
		res.redirect("/logout");
		return;
	}
	else if (sess.verified !== "T")
	{
		res.redirect("/verify_email");
		return;
	}
	else if (sess.valid !== "T")
	{
		res.redirect("/reported_account");
		return;
	}
	else if (isNaN(id))
    {
    	res.redirect("/matcha");
    	return;
    }

	dbc.query(sql.reportUser, [id], (err, result) =>
	{
		if (err) throw err;

		if (result.affectedRows === 1)
		{
			dbc.query(sql.selUserEmail, [sess.id], (err, result) =>
			{
				if (err) {throw err};

				const emailAddress	= result[0].email;
				const emailTitle 	= "Your profile has been reported | Cupid's Arrow";
				const msg 			= msgTemplates.report_account(url);

				email.main(emailAddress, emailTitle, msg).catch(console.error);
				res.redirect("/matcha");
			});
		} else
			res.redirect("/matcha");
	});

});
