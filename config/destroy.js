const util 			= require('util'),
      dbc 			= require('../model/sql_connect.js'),
      ft_util 		= require('../includes/ft_util.js');

dbc.query('DROP DATABASE matcha', (err, result) => {
	if (err) {
		if (String(err).indexOf('Unknown database') > -1)
			console.log('Database does not exist');
	} else console.log('Dropped matcha database');
	process.exit();
});
