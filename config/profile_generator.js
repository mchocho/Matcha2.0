const bcrypt		= require('bcryptjs');
const dbc 			= require('../model/sql_connect.js');

const usersArr = [
	{
		userInfo : [
			"Bev",
			"Beverly",
			"James",
			"F",
			"M",
			"1981-05-01",
			"123bev@mailinator.com",
			bcrypt.hashSync('OMG42', 10),
			"T",
			"T",
			"T",
			"I like long walks on the beach."
		],
		userLocation : [
			"-25.743243",
			"28.192465",
			"-",
			"Pretoria",
			"Gauteng",
			"South Africa"
		],
		userImage : "women/0.jpg"
	},
	{
		userInfo : [
			"Joe",
			"Joe",
			"Soap",
			"M",
			"F",
			"1984-07-03",
			"123joe@mailinator.com",
			bcrypt.hashSync('OMG42', 10),
			"T",
			"T",
			"T",
			"I like short walks on the beach."
			],
		userLocation : [
			"-25.776791",
			"28.220983",
			"-",
			"Pretoria",
			"Gauteng",
			"South Africa"
		],
		userImage : "men/0.jpg"
	},
	{
		userInfo : [
			"Jen",
			"Jennifer",
			"Jones",
			"F",
			"M",
			"1990-01-01",
			"123jen@mailinator.com",
			bcrypt.hashSync('OMG42', 10),
			"T",
			"T",
			"T",
			"I like short and long walks on the beach."
			],
		userLocation : [
			"-25.836444",
			"28.178663",
			"-",
			"Centurion",
			"Gauteng",
			"South Africa"
		],
		userImage : "women/2.jpg"
	}
];

function genUsers() {

	for (let i = 0; i < usersArr.length; i++) {
		insUser(usersArr[i]);
	}

	function insUser(user) {
		let sql = "INSERT INTO users (username, first_name, last_name, gender, preferences, DOB, email, password, online, verified, valid, biography) VALUES (?)";
		dbc.query(sql, [[...user.userInfo]], (err, res) => {
		if (err) {
			throw err;
		}
		userId = res.insertId;
		insLocations(user, userId);
	});
	}

	function insLocations(user, userId) {
		let sql = "INSERT INTO locations (lat, lng, street_address, area, state, country, user_id) VALUES (?)"
		dbc.query(sql, [[...user.userLocation, userId]], (err, res) => {
			if (err) {
				throw err;
			}
			insImages(user, userId);
		});
	}

	function insImages(user, userId) {
		let sql = "INSERT INTO images (name, user_id, profile_pic) VALUES (?)";
		dbc.query(sql, [[user.userImage, userId, "T"]], (err, res) => {
			if (err) {
				throw err;
			}
		});
	}
}
genUsers();