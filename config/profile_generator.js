const faker 		= require('faker'),
	  util 			= require('util'),
	  strescape 	= require('js-string-escape'),
	  dbc 			= require('../model/sql_connect.js'),
	  ft_util 		= require('../includes/ft_util.js');

function generate_user(i) {
	if (i === 40)
		return;
	const user = [
		strescape(faker.name.findName()),	//0
		strescape(faker.name.firstName()),	//1
		strescape(faker.name.lastName()),	//2
		strescape(['M', 'F'][ft_util.ranint(2)]),	//3
		strescape(['M', 'F', 'B'][ft_util.ranint(2)]),	//4
		strescape(faker.date.past()),	//5
		strescape(faker.internet.email()),	//6
		'54321',	//7
		['T', 'F'][ft_util.ranint(1)],	//8
		'T',
		'T',
		''		
	];
		
	let sql = `SELECT id FROM users WHERE username = '${user[0]}' OR email = '${user[6]}'`;
	dbc.query(sql, [[user[0], user[6]]], function(err, result) {
		if (err) throw err;
		if (result.length > 0)
		{
			console.log('Username or email already exists');
			generate_user(i);
			return;
		}
		sql = "INSERT INTO users (username, first_name, last_name, gender, preferences, DOB, email, password, online, verified, valid, biography) VALUES (?)";
		dbc.query(sql, [[...user]], function(err, result) {
			if (err) throw err;
			console.log("Number of records inserted: " + result.affectedRows);
			sql = "INSERT INTO images (name, user_id, profile_pic) VALUES (?)";
			dbc.query(sql, [[faker.random.image(), result.insertId, 'T']], function(err, result) {
				if (err) throw err;
				generate_user(i++);
			});
		});
	});
}

generate_user(0);
