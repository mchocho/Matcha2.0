const fs 		= require('fs'),
      util 		= require('util'),
      mysql 	= require("mysql"),
      credentials 	= require('../model/credentials.js'),
      ft_util 	= require('../includes/ft_util.js');


const users = credentials.users;
dbc = mysql.createConnection(users['thanos_setup']);

dbc.connect((err) => {
	if (err) throw err;
	fs.readFile('./setup.sql', 'utf8', (err, data) => {
		if (err) throw err;
		data.trim().split(';').forEach((value, index, arr) => {
			dbc.query(value, (err, result) => {
				if (err) throw err;
				if (index === arr.length - 1) {
					console.log("Created matcha database");
					console.log("Inserting profiles...");
					require('./profile_generator.js');
				}
			});
		});
	});
});
