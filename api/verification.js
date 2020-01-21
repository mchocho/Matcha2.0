const express 		= require('express'),
		session	    	= require('express-session'),
	  	path			= require('path'),
	  	mysql			= require('mysql'),
	  	body_p		= require('body-parser'),
	  	moment		= require('moment'),
	  	nodemailer 		= require('nodemailer'),
	  	os			= require('os'),
	  	util			= require('util'),
	  	uuidv4 		= require('uuid/v4'),
	  	bcrypt		= require('bcrypt');
	  	ft_util		= require('../includes/ft_util.js'),
	  	dbc			= require('../model/sql_connect.js'),
	  	email			= require('../includes/mail_client.js'),
		msgTemplates 	= require('../includes/email_templates.js');

let router = express.Router();
module.exports = router;

router.get('/:id', (req, res) => {
	
	res.send(req.params.id);
});

		  
