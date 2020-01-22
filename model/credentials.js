require('dotenv').config({path: '../.env'});

let setupCred;
let connCred;

if (process.env.OS == 'mac') {
	setupCred = {
		host		: process.env.HOST,
		user		: process.env.DB_USER,
		port		: process.env.PORT,
		password	: process.env.DB_PASS,
		socketPath	: process.env.SOCKET_PATH
	};
	connCred = {
		host		: process.env.HOST,
		user		: process.env.DB_USER,
		port		: process.env.PORT,
		password	: process.env.DB_PASS,
		database	: process.env.DB_NAME,
		socketPath	: process.env.SOCKET_PATH
	};
} else if (process.env.OS == 'windows') {
	setupCred = {
		host		: process.env.HOST,
		user		: process.env.DB_USER,
		password	: process.env.DB_PASS,
	};
	connCred = {
		host		: process.env.HOST,
		user		: process.env.DB_USER,
		password	: process.env.DB_PASS,
		database	: process.env.DB_NAME,
	};
}

module.exports = {
	setupCred,
	connCred
}
	

// let users = {
// 	"thanos": {
// 		host		: 'localhost',
// 		user 		: 'root',
// 		port		: '8080',
// 		password	: '654321',
// 		database  	: 'matcha',
// 		socketPath	: '/goinfre/mchocho/Documents/mamp/mysql/tmp/mysql.sock'
// 	  },
// 	  "roger_mbp": {
// 		host		: 'localhost',
// 		user 		: 'root',
// 		port		: '3000',
// 		password	: 'pw123456',
// 		database  	: 'matcha',
// 		socketPath	: '/Users/RogerHobbs/Desktop/Server/mysql/tmp/mysql.sock'
// 	  },
// 	  "roger": {
// 		host		: 'localhost',
// 		user 		: 'root',
// 		port		: '3000',
// 		password	: 'pw123456',
// 		database  	: 'matcha',
// 		socketPath	: '/goinfre/rhobbs/Desktop/server/mysql/tmp/mysql.sock'
// 	  },
// 	  "Titan": {
// 		host		: 'localhost',
// 		user 		: 'root',
// 		password	: '654321',
// 		database  	: 'matcha'
// 	  },
// 	  "roger_setup": {
// 		host		: 'localhost',
// 		user 		: 'root',
// 		port		: '3000',
// 		password	: 'pw123456',
// 		socketPath	: '/goinfre/rhobbs/Desktop/server/mysql/tmp/mysql.sock'
// 	  },
// 	  "roger_mbp_setup": {
// 		host		: 'localhost',
// 		user 		: 'root',
// 		port		: '3000',
// 		password	: 'pw123456',
// 		socketPath	: '/Users/RogerHobbs/Desktop/Server/mysql/tmp/mysql.sock'
// 	  },
// 	  "thanos_setup" : {
// 		host		: 'localhost',
// 		user 		: 'root',
// 		password	: '654321',
// 		socketPath	: '/goinfre/mchocho/Documents/mamp/mysql/tmp/mysql.sock'
// 	 },
// 	 "Titan_setup": {
// 		host		: 'localhost',
// 		user 		: 'root',
// 		password	: '654321'
// 	  }
// };

// module.exports.users = users;