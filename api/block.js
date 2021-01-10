const express       = require("express");

const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements.js");
const ft_util       = require("../includes/ft_util.js");

let router          = express.Router();

module.exports      = router;

router.post("/", (req, res) =>
{
  const sess      = req.session.user;
  const id        = req.body.value;
  const response  = {
    profile   : id,
    service   : "block"
  };
  
  res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client
  
  if (!ft_util.isobject(sess))
  {
      response.result = "Please sign in.";
      res.end(JSON.stringify(response));
      return;
  }
  else if (sess.verified !== 'T' || sess.valid !== 'T')
  {
      response.result = "Please verify your account.";
      res.end(JSON.stringify(response));
      return;
  }

  if (isNaN(id))
  {
    response.result = "Please specify a user to block.";
    res.end(JSON.stringify(response));
    return;
  }

  dbc.query(sql.selUserById, [id], (err, result) => {
    if (err) {throw err}
    
    //User does not exist
    if (result.length === 0)
    {
      response.result = "Please specify a user to block.";
      res.end(JSON.stringify(response));
      return;
    }

    checkIfProfileBlocked(result[0]);
  });


  function checkIfProfileBlocked(profile)
  {
    dbc.query(sql.selBlockedUser, [sess.id, profile.id], (err, result) =>
    {
      if (err) {throw err}

      const profileBlocked = result.length > 0;

      handleAccountConnection(profile, profileBlocked);
    });
  }

  function handleAccountConnection(profile, profileBlocked)
  {
    //Assume we're unblocking the profile
    let statement   = sql.delBlockedUser;
    let values      = [sess.id, profile.id];

    if (!profileBlocked)
    {
      //We're blocking the profile
      statement     = sql.insBlockedUser;
      values        = [[sess.id, profile.id]];
    }

    dbc.query(statement, values, (err, result) => {
      if (err) {throw err}

      if (result.affectedRows === 1)
      {
        response.result         = "Success";
        response.profileBlocked = !profileBlocked;
      }
      else
      {
        response.result         = "Failed";
        response.profileBlocked = profileBlocked;
      }
      res.end(JSON.stringify(response));
    });
  }
});