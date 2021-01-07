const fs 			= require('fs'),
      util 			= require('util'),
      mysql 		= require("mysql"),
      credentials 	= require('../model/credentials.js'),
    //   credentials 	= require('../model/users.js'),
      ft_util 		= require('../includes/ft_util.js');

dbc = mysql.createConnection(credentials.setupCred);
// dbc = mysql.createConnection(credentials.users.Titan_setup);

dbc.connect((err) => {
	if (err) throw err;
	fs.readFile('../model/setup.sql', 'utf8', (err, data) => {
		if (err) throw err;
		data.trim().split(';').forEach((value, index, arr) => {
			dbc.query(value, (err, result) => {
				if (err) throw err;
				if (index === arr.length - 1) {
					console.log("Created matcha database");
					console.log("Inserting profiles...");
					// require('./profile_generator.js');
					require('./profile_gen_2');
				}
			});
		});
	});
});
