const mysql = require("mysql");

dbc = mysql.createConnection({
	host		: 'localhost',
	user 		: 'root',
	port		: '8080',
	password	: '654321',
	database  	: 'matcha',
	socketPath	: '/goinfre/mchocho/documents/mamp/mysql/tmp/mysql.sock'
});

dbc.connect((err) => {
    if (err){
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
            return;
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
            return;
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
            return;
        }
    }
    console.log('Database connection was open.');
    // console.log(conect);
});

module.exports = this.dbc;

