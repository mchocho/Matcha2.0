const express 		= require('express'),
	  	path		= require('path'),
	  	body_p		= require('body-parser'),
	  	session 	= require('express-session'),
	  	uuidv4 		= require('uuid/v4'),
	  	app 		= express(),
		flash		= require('connect-flash'),
	  	PORT 		= 3000;

var server = require('http').createServer(app);
const io = require('socket.io')(server);

// CHAT
io.on('connection', (socket) => {
	console.log('a user connected - index.js');

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('add user', (username) => {
		socket.username = username;
		console.log('Socket user: ' + socket.username);
	});

	socket.on('chat message', (msg) => {
		console.log('message: ' + msg);
		io.emit('chat message', {
			user: socket.username,
			msg
		});
	});
});

require('dotenv').config();
app.use(flash());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(body_p.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
// Does the secret not change everytime? Yes, but only if the server stops or the this script fails to cache
app.use(session({secret: uuidv4(), cookie: {maxAge: 600000000, sameSite: 'lax'}, saveUninitialized: true, resave: true}));

if (app.get('env') === 'production')
	app.set('trust proxy', 1);

let signinRouter = require('./signin');
app.use('/', signinRouter);

let signupRouter = require('./signup');
app.use('/signup', signupRouter);

let verify_emailRouter = require('./verify_email');
app.use('/verify_email', verify_emailRouter);

let verifyUserEmail = require('./api/verification');
app.use('/verification', verifyUserEmail);

let forgotPassword = require('./forgot_password');
app.use('/forgot_password', forgotPassword);

let userRouter = require('./user');
app.use('/user', userRouter);

let matchaRouter = require('./matcha');
app.use('/matcha', matchaRouter);
// app.use('/matcha/:filter.:arg1?.:arg2?', matchaRouter);

let profileRouter = require('./profile');
app.use('/profile', profileRouter);

let notificationsRouter = require('./notifications');
app.use('/notifications', notificationsRouter);

let logoutRouter = require('./logout');
app.use('/logout', logoutRouter);

let chatRouter = require('./chat');
app.use('/chat', chatRouter);

app.use((req, res) => {
	const sess = req.session.user;

	if (!ft_util.isobject(sess)) {
			res.redirect('/logout');
			return;
	}
	else if (sess.verified !== 'T') {
			res.redirect('/verify_email');
			return;
	}
	else if (sess.valid !== 'T') {
			res.redirect('/reported_account');
			return;
	}

	Promise.all([
		ft_util.userNotificationStatus(dbc, sess.id),
		ft_util.getUserImages(dbc, sess.id)
	]).then((values) => {
		res.render('404', {
			title: '404',
			notifications: values[0].notifications,
			chats: values[0].chats,
			profile_pic: values[1][0]
		});
	}).catch(e => {
		throw (e);
	});
});

server.listen(PORT, () => {
	console.log('Server started on port ' + PORT);
});

