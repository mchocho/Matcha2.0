const express 		= require('express'),
	  	nodemailer 		= require('nodemailer'),
	  	util			= require('util'),
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
		let vals = ['T', tokenRow.user_id];
		if (tokenRow.request == 'registration') {
			dbc.query(sql.setUserVerification, vals, delTokenRow)
		} else if (tokenRow.request == 'password_reset') {
			vals = [tokenRow.new_password, tokenRow.user_id];
			dbc.query(sql.updatePasswd, vals, delTokenRow);
		}
	}

	function delTokenRow(err, result) {
		if (err) {throw err}
		if (result.affectedRows === 0) {
			console.log("There was an error in verification api, handle this error");
			return;
		}
		let vals = [tokenRow.id]
		dbc.query(sql.delTokenRow, vals, returnSuccess)	
	}

	function returnSuccess(err, result) {
		if (err) {throw err}
		let message;
		if (result.affectedRows === 0) {
			console.log("There was an error in verification api, handle this error");
			return;
		}
		if (tokenRow.request == 'registration') {
			message = 'You have successfully verified your account, please signin.';
		} else if (tokenRow.request == 'password_reset') {
			message = 'You have successfully changed your password, please signin';
		}
		req.flash('message', message);
		res.redirect('/');
	}
});

		  
