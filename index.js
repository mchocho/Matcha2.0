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
	res.sendfile('./views/signup.html');
});

app.get('/signup', (req, res) => {
	res.sendfile('./views/signup.html');
});

app.post('/signup/registration', (req, res) => {
	const n_user = req.body;
	let errors = new URL(__dirname + '/views/signup.html?')
	console.log(n_user);
	if (n_user.cupid === 'Submit')
	{
		if (n_user.username.length === 0)
			errors.searchParams.append('error_0', 'true');
		if (n_user.f_name.length === 0)
			errors.searchParams.append('error_1', 'true');
		if (n_user.l_name.length === 0)
			errors.searchParams.append('error_2', 'true');
		if (n_user.gender !== 'Female' && n_user.gender !== 'Male')
			errors += 'error_3="1"&';
		if (n_user.preference !== 'Female' || n_user.preference !== 'Male')
			n_user.preference = 'Both';
		if (!ft_util.isemail(n_user.email) )
			errors.searchParams.append('error_4', 'true');
		//if (ft_isvalidpassword(n_user.password))
		//	errors.searchParams.append('error_5', 'true');
		console.log('errorURL = ' + errors);
		if (errors.indexOf('error') == -1)
			console.log('Great your good to go!');
		else
			console.log('errors.href');
			//res.sendfile(errors);
	} else {
		console.log("Something went wrong, please try again");
	}
});


app.get('/signin', (req, res) => {
	res.sendfile('./views/signin.html');
});

app.get('/profile', (req, res) => {
	res.sendfile('./views/profile.html');
});



app.listen(3000, () => {
	console.log('Server started on port 3000');
});

