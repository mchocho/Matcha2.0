require("dotenv").config();

const express     = require("express");
const path        = require("path");
const bodyParser  = require("body-parser");
const session     = require("express-session");
const uuidv4      = require("uuid/v4");
const flash       = require("connect-flash");

const app         = express();
const PORT        = 3000;

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

app.use(flash());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist/"));
app.use("/flatpickr", express.static(__dirname + "/node_modules/flatpickr/dist/"));

// Does the secret not change everytime? Yes, but only if the server stops or the this script fails to cache
app.use(session({secret: uuidv4(), cookie: {maxAge: 6000000, sameSite: 'lax'}, saveUninitialized: true, resave: true}));

if (app.get("env") === "production")
  app.set("trust proxy", 1);

let signinRouter = require("./src/signin");
app.use("/", signinRouter);

let signupRouter = require("./src/signup");
app.use("/signup", signupRouter);

let verify_emailRouter = require("./src/verify_email");
app.use("/verify_email", verify_emailRouter);

let verifyUserEmail = require("./api/verification");
app.use("/verification", verifyUserEmail);

let forgotPassword = require("./src/forgot_password");
app.use("/forgot_password", forgotPassword);

let userRouter = require("./src/user");
app.use("/user", userRouter);

let genderRouter = require("./api/gender");
app.use("/gender", genderRouter);

let interestsRouter = require("./api/interests");
app.use("/interests", interestsRouter);

let preferencesRouter = require("./api/preferences");
app.use("/preferences", preferencesRouter);

let matchaRouter = require("./src/matcha");
app.use("/matcha", matchaRouter);

let profileRouter = require("./src/profile");
app.use("/profile", profileRouter);

let connectRouter = require("./api/connect");
app.use("/connect", connectRouter);

let reportRouter = require("./api/report");
app.use("/report", reportRouter);

let blockRouter = require("./api/block");
app.use("/block", blockRouter);

let notificationsRouter = require("./src/notifications");
app.use("/notifications", notificationsRouter);

let logoutRouter = require("./src/logout");
app.use("/logout", logoutRouter);

let chatRouter = require("./src/chat");
app.use("/chat", chatRouter);

let _404Router = require("./src/logout");
app.use("*", _404Router);

server.listen(PORT, () => {
  console.log("Socket started on port " + PORT);
});
