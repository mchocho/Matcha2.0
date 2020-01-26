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
	//server = require("http").createServer(app),
	//io = require("socket.io").listen(server);
	PORT = process.env.PORT || 3000;

var http = require("http");
// var socket = require('socket.io');

//Chat socket connection
const server = http.createServer(app);
// const io = socket(server);
var io = require("socket.io")(server);

require("dotenv").config();
app.use(flash());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(
	body_p.urlencoded({
		extended: true
	})
);
//app.use(express.static(__dirname + "/public"));

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

io.on("connection", (socket) => {
	console.log("New user connected");
	socket.on("chat message", (msg) => {
		console.log(msg);
		io.emit("chat message", msg);
	});
	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
});

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

//Chat route
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

server.listen(PORT, () => {
	console.log("Socket started on port " + PORT);
});
