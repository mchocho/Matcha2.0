require('dotenv').config();

const express = require("express"),
	path = require("path"),
	mysql = require("mysql"),
	body_p = require("body-parser"),
	moment = require("moment"),
	URL = require("url"),
	session = require("express-session"),
	uuidv4 = require("uuid/v4"),
	app = express(),
	flash = require("connect-flash"),
	server = require("http").createServer(app),
	io = require("socket.io")(server),
	dbc	= require('./model/sql_connect.js'),
	PORT = process.env.PORT || 3000;



require("dotenv").config();
app.use(flash());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(
	body_p.urlencoded({
		extended: true
	})
);
app.use(express.static(__dirname + "/public"));

app.use(express.static("public"));
// Does the secret not change everytime?
app.use(
	session({
		secret: uuidv4(),
		cookie: {
			maxAge: 600000000
		},
		saveUninitialized: true,
		resave: true
	})
);

var users = {};

var token = '/custom';


app.get('/startchat', (req, res) => {
	let statement = "SELECT * FROM chat_tokens";
	let token;
	dbc.query(statement, getChatTokens);

	function getChatTokens(err, result) {
		if (err) {throw err}
		token = result[0].token;
		res.redirect('/chat/' + token);
	}
});

app.get(`/chat/:id`, (req, res) => {
	//console.log("CUSTOM CHAT");

	const modo = io.of(`/${req.params.id}`);
	const route = `/${req.params.id}`;
	//console.log(req.params.id);

	modo.on('connection', (socket) => {
		console.log('CUSTOM CHAT new user');
	});

	res.render("customchat.pug", {
		chat: route
	});
});



// io.on('connection', (socket) => {
// 	console.log("New user connected");

// 	socket.on('new user', (data, callback) => {
// 		// checking to see if index of nickname given is not equal to -1, 
// 		// that means the name exists in the array
// 		if (data in users) {
// 			callback(false);
// 		} else {
// 			callback(true);

// 			// Storing the name in the socket
// 			socket.nickname = data;
// 			users[socket.nickname] = socket;
// 			// nicknames.push(socket.nickname);

// 			// emit nickname to all users so that it can update their lists
// 			updateNicknames();
// 		}
// 	});

// 	function updateNicknames() {
// 		// emit nickname to all users so that it can update their lists
// 		io.emit('usernames', Object.keys(users));
// 	}

// 	socket.on("chat message", (data, callback) => {
// 		// console.log(data);

// 		// Trim message to remove any white space at end
// 		var msg = data.trim();
// 		if (msg.substr(0, 3) === '/w ') {

// 			// remove the '/w ' at start of the string, we no longer need that
// 			msg = msg.substr(3);

// 			// find the index of the space
// 			var ind = msg.indexOf(' ');

// 			// if there is in fact a space (ie there is a message)
// 			if (ind !== -1) {

// 				// the name is the word following in the space, save that in name
// 				var name = msg.substring(0, ind);
// 				// the message is then everthing after the users name
// 				var msg = msg.substring(ind + 1);

// 				// check is that user in on the chatroom
// 				if (name in users) {
// 					users[name].emit("whisper", {
// 						msg: msg,
// 						nick: socket.nickname
// 					});
// 					users[socket.nickname].emit("whisper", {
// 						msg: msg,
// 						nick: socket.nickname
// 					});
// 					console.log('Whisper!');
// 				} else {
// 					// else user is not in chat room, cannot chat
// 					callback("Error! Enter a valid user.");
// 				}
// 			} else {
// 				// else there is no message / no space / no user ie there is
// 				// white space after the '/w '
// 				callback("Error! Please enter a message for your whisper.");
// 			}
// 		} else {
// 			// Telling the client to execute 'chat message'
// 			io.emit("chat message", {
// 				msg: msg,
// 				nick: socket.nickname
// 			});
// 			//socket.broadcast.emit() sends to everyone except the sender
// 		}
// 	});

// 	socket.on('disconnect', (data) => {

// 		// When disconnecting the users list should delete that member
// 		// This if not socketname means they came to the page but didnt bother
// 		// putting in a nickname, so they woudlnt be on the list, just return
// 		if (!socket.nickname) return;

// 		// else this will happen, splice removes their nickname from the array
// 		delete users[socket.nickname];
// 		// nicknames.splice(nicknames.indexOf(socket.nickname), 1);

// 		// then we should update the list of users on the page
// 		updateNicknames();

// 	});

// });



if (app.get("env") === "production") app.set("trust proxy", 1);

let signinRouter = require("./signin");
app.use("/", signinRouter);

let signupRouter = require("./signup");
app.use("/signup", signupRouter);

let verify_emailRouter = require("./verify_email");
app.use("/verify_email", verify_emailRouter);

// This route will do the actual email verification step
let verifyUserEmail = require("./api/verification");
app.use("/verification", verifyUserEmail);

//Chat route having problems with socket io throught this routing
//hence its at below this comment block
// let chatRouter = require('./chats');
// app.use('/chats', ());

app.get("/chat", (req, res) => {
	console.log("Hello chat.js");
	res.render("chat.pug");
});

let forgotPassword = require("./forgot_password");
app.use("/forgot_password", forgotPassword);

let userRouter = require("./user");
app.use("/user", userRouter);

let matchaRouter = require("./matcha");
app.use("/matcha", matchaRouter);

let profileRouter = require("./profile");
app.use("/profile", profileRouter);

let adminRouter = require("./admin");
app.use("/admin", adminRouter);

let logoutRouter = require("./logout");
app.use("/logout", logoutRouter);

app.use((req, res) => {
	res.render("404", {
		title: "404"
	});
});

// app.listen(PORT, () => {
// 	console.log("Server started on port " + PORT);
// });

// Socket io created a server calling 'server' (line 11) so we have to listen
// to that server. I dont know how server 'app' is affected?
server.listen(PORT, () => {
	console.log("Socket started on port " + PORT);
});
