const faker 	= require('faker/locale/en_GB');
const util 		= require('util');
const bcrypt	= require('bcryptjs');
const dbc 		= require('../model/sql_connect.js');
const ft_util = require('../includes/ft_util.js');
const count 	= 20;
const maxDefaultImages = 10;

function generate_user(i)
{
	if (i === count)
	{
		console.log(`Inserted ${count} profile records.`);
		process.exit();
	}


	const user = [
		faker.name.findName(),				//0
		faker.name.firstName(),				//1
		faker.name.lastName(),				//2
		['M', 'F'][ft_util.ranint(2)],		//3
		['M', 'F', 'B'][ft_util.ranint(3)],	//4
		faker.date.between('1940-01-01', '2000-12-31'),				//5
		faker.internet.email(),				//6
		bcrypt.hashSync('OMG42', 10),							//7
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

			imageGender = "women";
			if (user[3] == 'M') {
				imageGender = "men";
			}

			imagePath = imageGender
				+ "/" + ft_util.ranint(maxDefaultImages).toString()
				+ ".jpg"

			dbc.query(sql, [[imagePath, id, 'T']], (err, result) => {
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
					//TODO set up random connections and user interests
					generate_user(i + 1);
				});
			});
		});
	});
}
generate_user(0);
