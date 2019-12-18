const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  URL			= require('url'),
	  ft_util		= require('./includes/ft_util.js'),
	  nodemailer 	= require('nodemailer'),
	  os			= require('os'),
	  uuidv4 		= require('uuid/v4'),
	  msgs			= require('./includes/mail_client.js');
	  mailTemplates = require('./includes/email_templates.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	res.render('verify_email.pug', {errors: ft_util.init_errors()});
})