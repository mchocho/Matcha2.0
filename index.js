const express = require('express');
const	path = require('path');
const	body_p = require('body-parser');
const session = require('express-session');
const uuidv4 = require('uuid/v4');
const app = express();
const flash	= require('connect-flash');
const PORT = 3000;
const {addChatUser, getChatUser, removeChatUser} = require('./includes/chatUsers');

var server = require('http').createServer(app);
const io = require('socket.io')(server);

// CHAT
io.on('connection', (socket) => {
	console.log('a user connected - index.js');
	socket.on('joinRoom', ({username, room}) => {
		const user = addChatUser(socket.id, username, room);
		socket.join(user.room);

		// io.to(user.room).emit('fromServer', {
		// 	user: `hi ${user.username} welcome to chat`,
		// 	msg: 'you are in ' + room
		// });
	});

	socket.on('fromClient', (msg) => {
		const user = getChatUser(socket.id);
		io.to(user.room).emit('fromServer', {
			user: user.username,
			msg
		})
	});

	socket.on('disconnect', () => {
		removeChatUser(socket.id);
		console.log('user disconnected');
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

