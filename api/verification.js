const express 		= require('express'),
	  	nodemailer 		= require('nodemailer'),
	  	util			= require('util'),
	  	uuidv4 		= require('uuid/v4'),
	  	ft_util		= require('../includes/ft_util.js'),
	  	dbc			= require('../model/sql_connect.js'),
	  	email			= require('../includes/mail_client.js'),
		msgTemplates 	= require('../includes/email_templates.js'),
		sql 			= require('../model/sql_statements');

let router = express.Router();
module.exports = router;

router.get('/:id', (req, res) => {
	let tokenRow;
	const token = [req.params.id];
	dbc.query(sql.findByToken, token, getUserIdFromToken);

	function getUserIdFromToken(err, result) {
		if (err) {throw err}
		if (result.length === 0) {
			res.redirect('/'); // This failure needs to be handled better
			return;
		}
		tokenRow = result[0];
		const verified = ["verified"];
		dbc.query(sql.setTokenVerified, verified)
	}
});

		  
