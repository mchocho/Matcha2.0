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
app.use(express.static(__dirname + '/public'));

//Home Route
let signupRouter = require('./signup');
app.use('/', signupRouter);

let signinRouter = require('./signin');
app.use('/signin', signinRouter);

let profileRouter = require('./profile');
app.use('/profile', profileRouter);

let matchaRouter = require('./matcha');
app.use('/matcha', matchaRouter);

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

