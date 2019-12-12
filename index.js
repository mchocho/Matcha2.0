const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  URL			= require('url'),
	  ft_util		= require('./includes/ft_util.js'),
	  app 			= express(),
	  PORT 			= process.env.PORT || 5000,
	  nodemailer 	= require('nodemailer'),
	  os			= require('os'),
	  email			= require('./includes/mail_client.js');

//TESTS
// const util = require('util');
// const token = os.hostname + "/signup/verify_email/:Some unique key";
// console.log(token);
///TESTS



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(body_p.urlencoded({extended: true}));
const middleware = [
	app.use(express.static(__dirname + '/public')),
	// app.use(expressip().getIpInfoMiddleware),
];

app.get('/signup', (req, res, next) => {
	next();
});
//Home Route
app.get('/', (req, res) => {
	//res.sendfile('./views/signup.html');
	res.render('signup.pug', {errors: ft_util.init_errors()});
});

app.post('/signup/registration', (req, res) => {
	const dbc 			= mysql.createConnection({
			  host		: 'localhost',
			  user 		: 'root',
			  port		: '8080',
			  password	: '654321',
			  database  : 'matcha',
			  socketPath: '/goinfre/mchocho/MAMP/mysql/tmp/mysql.sock'
			  //socketPath: '/goinfre/mchocho/documents/mamp/mysql/tmp/mysql.sock'
			});
	const user = req.body;
	const token = os.hostname + "/signup/verify_email/:" + 'Some Unique Key';
	let errors = ft_util.init_errors(),
		result = true;
	const msg = `<h1>Verify Your Email</h1>
		<p>Please confirm that you want to use this email address for your Cupid's Arrow account. Once it's done you will be able to start using this service.</p>
		<button>
			<a href="${token}" target="_blank">Verify my email</a>
		</button>
		<br />
		Or copy and paste the link below into the address bar
		<br />
		<br />
		<p align="center">&copy Cupid's Arrow | 2019</p>`;

	if (user.cupid === 'Submit') {
		if (user.username === undefined || user.username.length === 0) {
			result = false;
			errors['error_0'] = 'Enter a username';
		}
		if (user.f_name === undefined || user.f_name.length === 0) {
			result = false;
			errors['error_1'] = 'Enter your first name';
		}
		if (user.l_name === undefined || user.l_name.length === 0) {
			result = false;
			errors['error_2'] = 'Enter your last name';
		}
		if (user.gender !== 'Female' && user.gender !== 'Male') {
			result = false;
			errors['error_3'] = 'Specify your gender';
		}
		if (user.preference !== 'Female' || user.preference !== 'Male')
			user.preference = 'Both';
		if (!moment(user.dob, "YYYY-MM-DD").isValid()) {
			result = false;
			errors['error_5'] = 'Enter your date of birth';
		}
		if (!ft_util.isemail(user.email) ) {
			result = false;
			errors['error_4'] = 'Enter your email';
		}
		if (user.password === undefined || user.password.length < 5) {
			result = false;
			errors['error_6'] = 'Provide a valid password of 5 characters or more';
		} else if (user.password !== user.password_confirm) {
			result = false;
			errors['error_7'] = 'The passwords you provided don\'t match.'
		}

		if (result === true) {
			dbc.connect((err) => {
				let sql;
				if (err) {
				//TESTS
					console.error('error connecting: ' + err.stack);
					return;
				}
					console.log('connected as id ' + dbc.threadId);
				console.log('Great you\'re good to go!');
				//ENDOF TESTS


				sql = "SELECT id FROM users WHERE (username = ?)";
				dbc.query(sql, [user.username], (err, result) => {
					if (err) throw err;
					if (result.length !== 0) {
						result = false;
						errors['error_0'] = 'Username already exists';
					}

					sql = "SELECT id FROM users WHERE (email = ?)";
					dbc.query(sql, [user.email], (err, result) => {
						if (err) throw err;
						if (result.length !== 0) {
							result = false;
							errors['error_1'] = 'Email already exists';
						}

						if (result === false) {
							console.log(errors);
							return;
							//We should redirect user back to registration page instead
						}
		
						sql = "INSERT INTO users (username, first_name, last_name, gender, preferences, DOB, email, password, online, verified, biography) VALUES ?;",
						values = [
							  [
								user.username, 
								user.f_name, 
								user.l_name, 
								user.gender.charAt(0), 
								user.preference.charAt(0), 
								user.dob, 
								user.email, 
								user.password, 
								'F', 'F', ''
							  ]
						];
						dbc.query(sql,
							[values],
							function (err, result) {
							if (err) throw err;
							console.log("Number of records inserted: " + result.affectedRows);
							email.main(user.email, "Email verification | Cupid's Arrow", msg);
						});
					});
				});
			});
		}
		else
			// res.redirect('/');
			console.log('Error object --> ' + util.inspect(errors));
	} else {
		console.log("Something went wrong, please try again");
		res.redirect('/');
	}
});

app.get('/signin', (req, res) => {
	res.render('signin.pug');
});

app.post('/signin/login', (req, res) => {
	const dbc 			= mysql.createConnection({
		host		: 'localhost',
		user 		: 'root',
		port		: '8080',
		password	: '654321',
		database  : 'matcha',
		socketPath: '/goinfre/mchocho/MAMP/mysql/tmp/mysql.sock'
	  });
	const user = req.body;
	let errors = ft_util.init_errors(),
		result = true;
	console.log(user);
	if (user.cupid === 'Submit') {
		if (user.username.length === 0) {
			result = false;
			errors['error_0'] = 'Enter a username';
		}
		if (user.password.length === 0) {
			result = false;
			errors['error_1'] = 'Enter your password';
		}
		if (result === true) {
			dbc.connect((err) => {
				let sql;
				if (err) {
				//TESTS
					console.error('error connecting: ' + err.stack);
					return;
				}
					console.log('connected as id ' + dbc.threadId);
					console.log('Great you\'re good to go!');
				//ENDOF TESTS

				sql = "SELECT * FROM users WHERE (password = ?) AND ((username = ?) OR (email = ?))";

				dbc.query(sql, [user.password, user.username, user.username], (err, result) => {
					if (err) throw err;
					if (result.length == 0) {
						console.log("Userr credintials don't exist");
						//redirect user back to sign in page.
					}
					else
					{
						console.log('Welcome back ' + user.username);
					}
	
				});
			});
		} else {
			console.log();
			res.redirect('/signin');
		}
	}
});

app.get('/profile', (req, res) => {
	res.render('profile.pug', {
		title: 'The Fresh Prince\'s profile!',
		user: {
			username: 'Your matches',
			sex: 'M',
			first_name: 'Will',
			last_name: 'Smith',
			preference: 'F',
			biography: "Today is a new day!",
			rating: 8,
			viewcount: 3889,
			picture: 'https://www.biography.com/.image/t_share/MTE4MDAzNDEwNzQzMTY2NDc4/will-smith-9542165-1-402.jpg'
		}
	});
});


app.get('/matcha', (req, res) => {
	res.render('matcha.pug', {
		title: 'Find your match',
		users: [
			{
				id: 1,
				username: 'Queen B',
				sex: 'F',
				first_name: 'Jane',
				last_name: 'Doe',
				preference: 'M',
				biography: "Today is a new day!",
				distance: '19 km away',
				rating: 9,
				picture: 'https://i0.wp.com/pmchollywoodlife.files.wordpress.com/2014/07/beyonce-no-makeup-selfie-boston-july-1-ftr.jpg?crop=0px,0px,600px,460px&resize=1000,750'
			},
			{
				id: 1,
				username: 'Queen B',
				sex: 'F',
				first_name: 'Jane',
				last_name: 'Doe',
				preference: 'M',
				biography: "Today is a new day!",
				distance: '19 km away',
				rating: 9,
				picture: 'https://i0.wp.com/pmchollywoodlife.files.wordpress.com/2014/07/beyonce-no-makeup-selfie-boston-july-1-ftr.jpg?crop=0px,0px,600px,460px&resize=1000,750'
			},
			{
				id: 2,
				username: 'Pixel Girl',
				sex: 'F',
				first_name: 'Mary',
				last_name: 'Jane',
				preference: 'M',
				biography: "Today is a new day!",
				distance: '65 km away',
				rating: 9,
				picture: 'https://www.pixelstalk.net/wp-content/uploads/2016/08/Cute-Girl-Wallpaper-HD.jpg'
			},
			{
				id: 3,
				username: 'Habji',
				sex: 'F',
				first_name: 'Dorothy',
				last_name: 'Jane',
				preference: 'M',
				biography: "Today is a new day!",
				distance: '32 km away',
				rating: 9,
				picture: 'https://www.pixelstalk.net/wp-content/uploads/2016/08/Cute-Girl-Photography.jpg'
			}
		]
	});
});


/*app.get('/profile/edit_profile', (req, res) => {
	const user = req.body;
	if (user.)

});*/

app.use((req, res) => {
	res.render('404', {title: '404'});
});


app.listen(3000, () => {
	console.log('Server started on port 3000');
});

