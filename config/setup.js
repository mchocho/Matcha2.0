const fs 		= require('fs'),
      util 		= require('util'),
      mysql 	= require("mysql"),
      users 	= require('../model/credentials.js'),
      ft_util 	= require('../includes/ft_util.js');

//Predefined credentials break this script
dbc = mysql.createConnection({
	host		: 'localhost',
	user 		: 'root',
	password	: '654321'
});

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
