const express = require('express'),
	  path = require('path'),
	  ft_util = require('./includes/ft_util.js'),
	  app = express(); //Install App

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use('/css', express.static(__dirname + 'css'));
//app.use('/images', express.static(__dirname + '/images'));
const middleware = [
	app.use(express.static(__dirname + '/public')),
		app.use(express.urlencoded())
];


//Home Route
app.get('/', (req, res) => {
	//res.sendfile('./views/signup.html');
	res.render('signup.pug', { errors: ft_util.init_errors() });
});

app.post('/signup/registration', (req, res) => {
	const n_user = req.body;
	let errors = ft_util.init_errors(),
		result = true;
	console.log(n_user);
	if (n_user.cupid === 'Submit') {
		if (n_user.username.length === 0) {
			result = false;
			errors['error_0'] = 'Enter a username';
		}
		if (n_user.f_name.length === 0) {
			result = false;
			errors['error_1'] = 'Enter your first name';
		}
		if (n_user.l_name.length === 0) {
			result = false;
			errors['error_2'] = 'Enter your last name';
		}
		if (n_user.gender !== 'Female' && n_user.gender !== 'Male') {
			result = false;
			errors['error_3'] = 'Specify your gender';
		}
		if (!ft_util.isemail(n_user.email) ) {
			result = false;
			errors['error_4'] = 'Enter your email';
		}
		if (n_user.password.length < 5) {//ft_isvalidpassword(n_user.password)) {
			result = false;
			errors['error_5'] = 'Provide a valid password of 5 characters or more';
		} else if (n_user.password !== n_user.password_confirm) {
			result = false;
			errors['error_6'] = 'The passwords you provided don\'t match.'
		}
		if (n_user.preference !== 'Female' || n_user.preference !== 'Male')
			n_user.preference = 'Both';

		if (result === true)
			console.log('Great you\'re good to go!');
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
		user: {
			username: 'The Fresh Prince',
			sex: 'M',
			preference: 'F',
			fullname: 'Will Smith',
			biography: "Today is a new day!",
			rating: 8,
			viewcount: 3889,
			picture: 'https://www.biography.com/.image/t_share/MTE4MDAzNDEwNzQzMTY2NDc4/will-smith-9542165-1-402.jpg'
		}
	});
});



app.listen(3000, () => {
	console.log('Server started on port 3000');
});

