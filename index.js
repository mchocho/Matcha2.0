const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql2'),
	  expressip 	= require('express-ip'),
	  UIDGenerator 	= require('uid-generator'),
	  uidgen 		= new UIDGenerator(),
	  // bcrypt 	= require('bcrypt'),
	 // dbconfig		= require('./config/database.js'),
	  ft_util		= require('./includes/ft_util.js'),
	  app 			= express(),
	  PORT 			= process.env.PORT || 5000
	 /* dbc 			= mysql.createConnection({
										  host		: 'localhost',
										  user 		: 'root',
										  port		: '8080',
										  password	: '654321',
										  database  : 'matcha',
										  socketPath: '/goinfre/mchocho/documents/mamp/mysql/tmp/mysql.sock'
										});*/

//TESTS

const util = require('util');

// dbc.connection();

// console.log('Connection object --> ' + util.inspect(dbc));


///TESTS

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// app.set("PORT", PORT);
//app.set('trust proxy', true);
// app.set('trust proxy', true);


const middleware = [
	app.use(express.static(__dirname + '/public')),
	app.use(express.urlencoded())
	// app.use(expressip().getIpInfoMiddleware),
	
];


//Home Route
app.get('/', (req, res) => {
	//res.sendfile('./views/signup.html');
	res.render('signup.pug', {errors: ft_util.init_errors()});
	

	/*
	console.log('Express started on http://localhost:' +
        app.get('PORT') + '; press Ctrl-C to terminate.');
	const ipInfo = req.ipInfo;
	const message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
	console.log(message);
	console.log("IP address: " + req.ip);
	*/
});

app.post('/signup/registration', (req, res) => {
	const dbc 			= mysql.createConnection({
			  host		: 'localhost',
			  user 		: 'root',
			  port		: '8080',
			  password	: '654321',
			  database  : 'matcha',
			  socketPath: '/goinfre/mchocho/documents/mamp/mysql/tmp/mysql.sock'
			});
	const user = req.body;
	let errors = ft_util.init_errors(),
		result = true;

	if (user.cupid === 'Submit') {
		if (user.username.length === 0) {
			result = false;
			errors['error_0'] = 'Enter a username';
		}
		if (user.f_name.length === 0) {
			result = false;
			errors['error_1'] = 'Enter your first name';
		}
		if (user.l_name.length === 0) {
			result = false;
			errors['error_2'] = 'Enter your last name';
		}
		if (user.gender !== 'Female' && user.gender !== 'Male') {
			result = false;
			errors['error_3'] = 'Specify your gender';
		}
		if (!ft_util.isemail(user.email) ) {
			result = false;
			errors['error_4'] = 'Enter your email';
		}
		if (user.password.length < 5) {//ft_isvalidpassword(user.password)) {
			result = false;
			errors['error_5'] = 'Provide a valid password of 5 characters or more';
		} else if (user.password !== user.password_confirm) {
			result = false;
			errors['error_6'] = 'The passwords you provided don\'t match.'
		}
		if (user.preference !== 'Female' || user.preference !== 'Male')
			user.preference = 'Both';

		if (result === true) {
			dbc.connect(function(err) {
				if (err) {
				//
					console.error('error connecting: ' + err.stack);
					return;
				}
				//
					console.log('connected as id ' + dbc.threadId);
				console.log('Great you\'re good to go!');
				var sql = "INSERT INTO users (username, first_name, last_name, gender, preferences, DOB, email, password, online, verified, biography) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
				dbc.query(sql,
					[],
					function (err, result) {
					if (err) throw err;
					console.log("1 record inserted");
				});
			});
		}
		else
			res.redirect('/');
	} else {
		console.log("Something went wrong, please try again");
		res.redirect('/');
	}
});

app.get('/signin', (req, res) => {
	res.render('signin.pug');
});

app.post('/signin/login', (req, res) => {
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
		if (res === true)
			console.log('Great you\'re good to go');
		else
			res.redirect('/signin');
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
		title: 'The Fresh Prince\'s profile!',
		user: {
			username: 'The Fresh Prince',
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

