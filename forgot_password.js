const express 		= require('express'),
	  	dbc			= require('./model/sql_connect.js'),
		sql			= require('./model/sql_statements');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	res.render('forgot_password');
});