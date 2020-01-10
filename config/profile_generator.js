const faker 		= require('faker'),
	  util 			= require('util'),
	  dbc 			= require('../model/sql_connect.js'),
	  ft_util 		= require('../includes/ft_util.js'),
	  count 		= 500;

function generate_user(i) {
	if (i === count) {
		console.log('Inserted ' + count + ' profile records.');
		process.exit();
	}
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
		faker.random.words()		
	];
	let sql = "SELECT id FROM users WHERE username = ? OR email = ?",
		id;

	dbc.query(sql, [user[0], user[6]], (err, result) => {
		if (err) throw err;
		if (result.length > 0)
		{
			console.log('Username or email already exists');
			generate_user(i);
			return;
		}
		sql = "INSERT INTO users (username, first_name, last_name, gender, preferences, DOB, email, password, online, verified, valid, biography) VALUES (?)";
		dbc.query(sql, [[...user]], (err, result) => {
			if (err) throw err;
			sql = "INSERT INTO images (name, user_id, profile_pic) VALUES (?)";
			id = result.insertId;
			dbc.query(sql, [
					[(faker.random.image()) + '?random=' + Date.now(), id, 'T'],
					[(faker.random.image()) + '?random=' + Date.now(), id, 'F'],
					[(faker.random.image()) + '?random=' + Date.now(), id, 'F'],
					[(faker.random.image()) + '?random=' + Date.now(), id, 'F'],
					[(faker.random.image()) + '?random=' + Date.now(), id, 'F']
				], (err, result) => {
				if (err) throw err;
				sql = "INSERT INTO locations (lat, lng, street_address, area, state, country, user_id) VALUES (?)";
				dbc.query(sql, [[
						faker.address.latitude(),
						faker.address.longitude(),
						faker.address.streetAddress() + ' ' + faker.address.streetName(),
						faker.address.county(),
						faker.address.state(),
						faker.address.country(),
						id
					]], (err, result) => {
					if (err) throw err;
					generate_user(i + 1);
				});
			});
		});
	});
}
generate_user(0);
