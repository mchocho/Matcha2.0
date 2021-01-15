const 	  express 		= require('express'),
	  session 		= require('express-session'),
	  mysql			= require('mysql'),
	  dbc			= require('./model/sql_connect.js'),
	  ft_util		= require('./includes/ft_util.js'),
		app 			= express(),
		moment = require('moment');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	let sql = "UPDATE users SET online = 'F', last_seen = ? WHERE id = ?";
	if (ft_util.isobject(sess))
		dbc.query(sql, [moment().format("YYYY-MM-DD HH:mm:ss"), sess.id], (err, result) => {
			if (err) throw err;
			req.session.destroy(function() {
				res.redirect('/');
			});
		});
	else res.redirect('/');
});
