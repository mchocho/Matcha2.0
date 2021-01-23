const express       = require("express");

const dbc           = require("../model/sql_connect.js");
const email         = require("../includes/mail_client.js");
const msgTemplates  = require("../includes/email_templates.js");
const ft_util       = require("../includes/ft_util.js");
const sql           = require("../model/sql_statements");

const router        = express.Router();

module.exports      = router;

router.post("/", (req, res) =>
{
  const sess         = req.session.user;
  const userSignedIn = !!sess;
  const response     = { key : "gender" };

  res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

  if (!userSignedIn)
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

  validateGender();

  function validateGender()
  {
    const gender       = req.body.value;

    if (gender !== 'M' && gender !== 'F')
    {
      response.result  = "Please specify your gender.";
      res.end(JSON.stringify(response));
      return;
    }

    updateNewGender(gender);
  }

  function updateNewGender(gender)
  {
      dbc.query(sql.updateUserGender, [gender, sess.id], (err, result) =>
      {
          if (err) {throw err}

          updateSession(gender);
      });
  }

  function updateSession(gender)
  {
      sess.gender = gender;

      req.session.save(err => {
          if (err) {throw err}

          response.result = "Success";
          
          res.end(JSON.stringify(response));
      });
  }
});