const express = require("express");
// const app = express();
const path = require('path');
const http = require('http');

//socket.io instantiation
const socket = require('socket.io');

const server = http.createServer(app);
const io = socket(server);

let router = express.Router();
module.exports = router;

//Listen on every connection (socket.io)
io.on('connection', (socket) => {
	console.log('New user connected');
	socket.on('chat message', (msg) => {
		io.emit('chat message', msg);
	});
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

//routes
app.get('/', (req, res) => {
	//console.log(__dirname);
	console.log('Hello chats.js');
	res.render('chat.pug');
});

//Listen on port
// server.listen(port, () => {
	// 	console.log(`Server is running on port ${port}`);
	// });
	
//set the template engine
	// app.set('views', path.join(__dirname, 'views'));
	// app.set('view engine', 'pug');
	
	//middlewares
	// app.use(express.static("public"));


// THIS IS THE SOCKET.IO EXAMPLE I WAS WORKING ON
// io.on("connection", (socket) => {
// 	console.log("New user connected");
// 	var addedUser = false;

// 	// When client emits 'chat message', this listens and executes
// 	socket.on("chat message", (msg) => {
// 		console.log(msg);
// 		// Telling the client to execute 'chat message'
// 		io.emit("chat message", {
// 			username: 'toto', // socket.username
// 			message: msg
// 		});
// 	});

// 	// When client emits 'add user', this listens and executes
// 	socket.on('add user', (username) => {
// 		if (addedUser) return;

// 		// Store the username in the socket session for this client
// 		socket.username = username;
// 		++numUsers;
// 		addedUser = true;
// 		socket.emit('login', {
// 			numUsers: numUsers
// 		});

// 		// Echo globally (all clients) that new user has connected
// 		socket.broadcast.emit('user joined', {
// 			username: socket.username,
// 			numUsers: numUsers
// 		});
// 	});

// 	socket.on("disconnect", () => {
// 		console.log("User disconnected");
// 		if (addedUser) {
// 			--numUsers;

// 			// Echo globally (all clients) that this client has left
// 			socket.broadcast.emit('user left', {
// 				username: socket.username,
// 				numUsers: numUsers
// 			});
// 		}
// 	});
// });
