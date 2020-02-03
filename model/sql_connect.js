const mysql = require("mysql"),
      // credentials = require("./credentials");
    //   util          = require('util'),
      credentials = require("./users");

// console.log('Credentials --> ' + util.inspect(credentials.users.Titan));

// dbc = mysql.createConnection(credentials.connCred);

dbc = mysql.createConnection(credentials.users.Titan);

dbc.connect((err) => {
    if (err){
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
            throw err;
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
            throw err;
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
            throw err;
        }
    }
});

module.exports = dbc;

