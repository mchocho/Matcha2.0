const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
      session	    = require('express-session'),
      dbc			= require('./model/sql_connect.js'),
	  ft_util		= require('./includes/ft_util.js'),
	  app 			= express(),
	  os			= require('os'),
	  util			= require('util');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
    /*const sess = req.session[0];
	if (!ft_util.isobject(sess))
		res.redirect('/..');
	if (sess.verified === 'F')
		res.redirect('/verify_email');
    else if (sess.valid === 'F')
        res.redirect('/reported_account');*/
	res.sendfile('./views/notifications.html');
});