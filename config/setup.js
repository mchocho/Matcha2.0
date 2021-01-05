const fs          = require("fs");
const util        = require("util");
const mysql       = require("mysql");

const credentials = require("../model/credentials.js");

const file        = "../model/setup.sql";
const dbc         = mysql.createConnection(credentials.setupCred);

dbc.connect(err =>
{
  if (err) {throw err}

  fs.readFile(file, "utf8", (err, data) =>
  {
    if (err) {throw err}
    
    const statements = data.trim().split(';');

    //Parse sql statements
    statements.forEach((value, i) =>
    {

      //Run statement
      dbc.query(value.trim(), (err, result) =>
      {      
        if (err) {throw err}
        
        if (i == statements.length - 1)
        {
          console.log("Created matcha database");
          console.log("Inserting profiles...");
          
          require("./profile_gen_two.js");
        }
      });
    });
  });
})