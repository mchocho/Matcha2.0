require('dotenv').config({path: '../.env'});
const util = require('util');


let setupCred;
let connCred;

if (process.env.OS == 'mac') {
	setupCred = {
		host		: process.env.HOST,
		user		: process.env.DB_USER,
		port		: process.env.PORT,
		// password	: process.env.DB_PASS,
		socketPath	: process.env.SOCKET_PATH
	};
	connCred = {
		host		: process.env.HOST,
		user		: process.env.DB_USER,
		port		: process.env.PORT,
		// password	: process.env.DB_PASS,
		database	: process.env.DB_NAME,
		socketPath	: process.env.SOCKET_PATH
	};
} else {//Default to windows 
	setupCred = {
		host		: process.env.HOST,
		user		: process.env.DB_USER
		// password	: process.env.DB_PASS,
	};
	connCred = {
		host		: process.env.HOST,
		user		: process.env.DB_USER,
		// password	: process.env.DB_PASS,
		database	: process.env.DB_NAME
	};
}

module.exports = {
	setupCred,
	connCred
}
