const dbc       = require("../model/sql_connect.js")
const sql       = require("../model/sql_statements");;

dbc.query(sql.dropMatcha, (err, result) =>
{
  if (err)
  {
    console.log(err);
    
    if (String(err).indexOf('Unknown database') > -1)
      console.log('Database does not exist');
  }
  else
    console.log('Bye Cupid');

  process.exit();
});
