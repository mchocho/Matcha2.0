const mysql = require("mysql"),
      users = require("./credentials.js");


dbc = mysql.createConnection(users['thanos']);
//dbc = mysql.createConnection(users['roger']);

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

