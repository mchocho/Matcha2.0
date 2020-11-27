const fs 			= require('fs');
const util 			= require('util');
const mysql 		= require("mysql");
const credentials = require('../model/credentials.js');

// const credentials 	= require('../model/users.js');

console.log(credentials);
dbc = mysql.createConnection(credentials.setupCred);
// dbc = mysql.createConnection(credentials.users.Titan_setup);

dbc.connect(err =>
{
	if (err) throw err;

	fs.readFile('../model/setup.sql', 'utf8', (err, data) =>
	{
		if (err) {throw err}
		
		//Parse sql statements
		data.trim().split(';').forEach((value, index, arr) =>
		{
			//Run statement
			dbc.query(value, (err, result) =>
			{
				if (err) {throw err}
				
				if (index === arr.length - 1)
				{
					console.log("Created matcha database");
					// console.log("Inserting profiles...");
					// require('./profile_generator.js');
				}
			});
		});
	});
});
