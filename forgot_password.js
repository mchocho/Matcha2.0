const express 		= require('express'),
	  	dbc			= require('./model/sql_connect.js'),
		sql			= require('./model/sql_statements');

let router = express.Router();
module.exports = router;

router.route('/')
.get((req, res) => {
	res.render('forgot_password');
}).post((req, res) => {
	let vals = [req.body.username];
	dbc.query(sql.selUserByUname, vals, getUserId);

	function getUserId(err, result) {
		if (err) {throw err}
	}
});