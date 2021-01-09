const 	  express 		= require('express'),
	  session 		= require('express-session'),
	  mysql			= require('mysql'),
	  dbc			= require('./model/sql_connect.js'),
	  ft_util		= require('./includes/ft_util.js'),
	  app 			= express();

let router = express.Router();
module.exports = router;

app.get('/', (req, res) => {
	const sess = req.session.user;
	let sql = "UPDATE users SET online = 'F' WHERE id = ?";
	if (ft_util.isobject(sess))
		dbc.query(sql, [sess.id], (err, result) => {
			if (err) throw err;
			req.session.destroy(function() {
				res.redirect('/');
			});
		});
	else res.redirect('/');
});
