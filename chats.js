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
