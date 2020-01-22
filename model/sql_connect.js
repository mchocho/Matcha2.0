const mysql = require("mysql"),
      credentials = require("./credentials.js");

const users = credentials.users;

dbc = mysql.createConnection(users['roger']);

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

