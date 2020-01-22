const 	  express 		= require('express'),
	  session	    	= require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  uuidv4 		= require('uuid/v4'),
	  moment		= require('moment'),
	  os			= require('os'),
	  nodemailer	 	= require('nodemailer'),
	  util			= require('util'),
	  dbc			= require('./model/sql_connect.js'),
	  ft_util		= require('./includes/ft_util.js'),
	  email			= require('./includes/mail_client.js'),
	  msgTemplates 		= require('./includes/email_templates.js');

let router = express.Router();
module.exports = router;

router.get('/:id', (req, res) => {
	const sess = req.session.user,
		id = Number(req.params.id),
		token = uuidv4(),
		url = "http://localhost:3000/verification/?key=" + token;
	let    sql = "UPDATE users SET valid = 'F' WHERE id = ?";

	if (!ft_util.isobject(sess)) {
		res.redirect('/logout');
		return;
	}
	else if (sess.verified !== 'T') {
		res.redirect('/verify_email');
		return;
	}
	else if (sess.valid !== 'T') {
		res.redirect('/reported_account');
		return;
	}
	else if (isNaN(id))
        {
                res.redirect('/matcha');
                return;
        }

	dbc.query(sql, [id], (err, result) => {
		if (err) throw err;
		if (1) { // The row was updated
			sql = "SELECT email FROM users WHERE id = ?";
			dbc.query(sql, [sess.id], (err, result) => {
				if (err) throw err;
				email.main(result.email, "Your profile has been reported | Cupid's Arrow", msgTemplates.report_account(url)).catch(console.error);
				res.redirect('/matcha');
			});
		} else
			res.redirect('/matcha');
	});

});
