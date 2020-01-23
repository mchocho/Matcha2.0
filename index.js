const express = require('express'),
	path = require('path'),
	mysql = require('mysql'),
	body_p = require('body-parser'),
	moment = require('moment'),
	URL = require('url'),
	session = require('express-session'),
	uuidv4 = require('uuid/v4'),
	app = express(),
	flash = require('connect-flash'),
	http = require('http'),
	socket = require('socket.io'),
	PORT = process.env.PORT || 3000;

require('dotenv').config();
app.use(flash());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(body_p.urlencoded({
	extended: true
}));
app.use(express.static(__dirname + '/public'));
// Does the secret not change everytime?
app.use(session({
	secret: uuidv4(),
	cookie: {
		maxAge: 600000000
	},
	saveUninitialized: true,
	resave: true
}));

// Add headers
app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

//Chat socket connection
const server = http.createServer(app);
const io = socket(server);

io.on('connect', (socket) => {
	console.log('New user connected');
	socket.on('chat message', (msg) => {
		console.log(msg);
		io.emit('chat message', msg);
	});
	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

io.on('connection', (socket) => {
	console.log('New user connected');
	socket.on('chat message', (msg) => {
		console.log(msg);
		io.emit('chat message', msg);
	});
	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});


if (app.get('env') === 'production')
	app.set('trust proxy', 1);

let signinRouter = require('./signin');
app.use('/', signinRouter);

let signupRouter = require('./signup');
app.use('/signup', signupRouter);

let verify_emailRouter = require('./verify_email');
app.use('/verify_email', verify_emailRouter);

// This route will do the actual email verification step
let verifyUserEmail = require('./api/verification');
app.use('/verification', verifyUserEmail);

//Chat route
// let chatRouter = require('./chats');
// app.use('/chats', ());
app.get('/chats', (req, res) => {
	console.log('Hello chats.js');
	res.render('chat.pug');
});

let forgotPassword = require('./forgot_password');
app.use('/forgot_password', forgotPassword);

let userRouter = require('./user');
app.use('/user', userRouter);

let matchaRouter = require('./matcha');
app.use('/matcha', matchaRouter);

let profileRouter = require('./profile');
app.use('/profile', profileRouter);

let adminRouter = require('./admin');
app.use('/admin', adminRouter);

let logoutRouter = require('./logout');
app.use('/logout', logoutRouter);

app.use((req, res) => {
	res.render('404', {
		title: '404'
	});
});

app.listen(PORT, () => {
	console.log('Server started on port ' + PORT);
});
