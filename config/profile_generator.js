const faker 		= require('faker'),
	  util 			= require('util'),
	  dbc 			= require('../model/sql_connect.js'),
	  ft_util 		= require('../includes/ft_util.js');

function generate_user(i) {
	if (i === 40)
		return;
	const user = [
		faker.name.findName(),				//0
		faker.name.firstName(),				//1
		faker.name.lastName(),				//2
		['M', 'F'][ft_util.ranint(2)],		//3
		['M', 'F', 'B'][ft_util.ranint(2)],	//4
		faker.date.past(),					//5
		faker.internet.email(),				//6
		'OMG42',							//7
		['T', 'F'][ft_util.ranint(1)],		//8
		'T',
		'T',
		''		
	];
		
	let sql = `SELECT id FROM users WHERE username = ? OR email = ?`;
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
			dbc.query(sql, [
					[faker.random.image(), result.insertId, 'T'],
					[faker.random.image(), result.insertId, 'F'],
					[faker.random.image(), result.insertId, 'F'],
					[faker.random.image(), result.insertId, 'F'],
					[faker.random.image(), result.insertId, 'F']
				], function(err, result) {
				if (err) throw err;
				generate_user(i++);
			});
		});
	});
}

generate_user(0);
