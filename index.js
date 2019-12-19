const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  moment		= require('moment'),
	  URL			= require('url'),
	  session 		= require('express-session'),
	  uuidv4 		= require('uuid/v4'),
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

// console.log(uuidv4());
///TESTS



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(body_p.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(session({secret: uuidv4(), cookie: {maxAge: 600000}, resave: false, saveUninitialized: true, resave: true}));


//I don't know why this block needs to be here
if (app.get('env') === 'production') 
	app.set('trust proxy', 1);



//Home Route
let signinRouter = require('./signin');
app.use('/', signinRouter);

let signupRouter = require('./signup');
app.use('/signup', signupRouter);

let verify_emailRouter = require('./verify_email');
app.use('/verify_email', verify_emailRouter);

let profileRouter = require('./profile');
app.use('/profile', profileRouter);

let matchaRouter = require('./matcha');
app.use('/matcha', matchaRouter);

/*app.get('/profile/edit_profile', (req, res) => {
	const user = req.body;
	if (user.)

});*/

let notificationRouter = require('./notifications');
app.use('/notifications', notificationRouter);


let logoutRouter = require('./logout');
app.use('/logout', logoutRouter);

app.use((req, res) => {
	res.render('404', {title: '404'});
});


app.listen(3000, () => {
	console.log('Server started on port 3000');
});

