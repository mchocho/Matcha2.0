require('dotenv').config({
	path: '../.env'
});

let setupCred;
let connCred;

if (process.env.OS == 'mac') {
	setupCred = {
		host: process.env.HOST,
		user: process.env.DB_USER,
		port: process.env.PORT,
		password: process.env.DB_PASS,
		socketPath: process.env.SOCKET_PATH
	};
	connCred = {
		host: process.env.HOST,
		user: process.env.DB_USER,
		port: process.env.PORT,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		socketPath: process.env.SOCKET_PATH
	};
} else if (process.env.DB_OS == 'windows') {
	setupCred = {
		host: process.env.HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
	};
	connCred = {
		host: process.env.HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
	};
}

module.exports = {
	setupCred,
	connCred
}
