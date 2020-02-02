const ft_util 		= require('../includes/ft_util.js'),
	  dbc			= require('../model/sql_connect.js'),
	  sql			= require('../model/sql_statements.js'),
	  email			= require('../includes/mail_client.js');

ft_util.updateFameRating(dbc, 1).then(values => {
	console.log(values);
	process.exit();
}).catch(err => {
	throw err;
	process.exit();
});

