const express       = require("express");

const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements");
const ft_util       = require("../includes/ft_util.js");
const email         = require("../includes/mail_client.js");
const msgTemplates  = require("../includes/email_templates.js");

let router          = express.Router();

module.exports      = router;

router.post("/", (req, res) =>
{
  const sess         = req.session.user;
  const userSignedIn = !!sess;
  const response     = { service : "report_profile" };

  res.writeHead(200, {"Content-Type": "text/plain"});
  
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

  const id = req.body.id;

  validateId(id);

  function validateId(id)
  {
    if (isNaN(id))
    {
      response.result = "Please specify a user to report.";
      res.end(JSON.stringify(response));
      return;
    }

    response.profile = id;
    getUser(id);
  }

  function getUser(id)
  {
    dbc.query(sql.selUserById, [id], (err, result) =>
    {
      if (err) {throw err}
      
      //User does not exist
      if (result.length === 0)
      {
        response.result = "Please specify a user to report.";
        res.end(JSON.stringify(response));
        return;
      }

      checkIfProfileBlocked(result[0]);
    });
  }

  function checkIfProfileBlocked(profile)
  {
    dbc.query(sql.selBlockedUser, [sess.id, profile.id], (err, result) =>
    {
      if (err) {throw err}

      if (result.length > 0)
      {
        response.result = "The user are trying to connect with has been blocked";
        res.end(JSON.stringify(response));
        return;
      }

      insertReportAccountToken(profile);
    });
  }

  function insertReportAccountToken(profile)
  {
    const token         = uuidv4();
    const url           = "http://localhost:3000/api/verification/?key=" + token;
    const insertValues  = [profile.id, token, "verification"];

    dbc.query(sql.insNewToken, [insertValues], (err, result) => {
      if (err) {throw err}

      profile.url = url;
      reportProfile(profile);
    });
  }

  function reportProfile(profile)
  {
    dbc.query(sql.reportUser, [profile.id], (err, result) => {
      if (err) {throw err}
      
      response.result = "Success";
      emailUserProfile(profile);
    });
  }

  function emailUserProfile(profile)
  {
    const emailAddress  = profile.email;
    const title         = "Your profile has been reported | Cupid's Arrow";
    const msg           = msgTemplates.report_account(profile.url);

    email.main(emailAddress, title, msg).catch(console.error);

    res.end(JSON.stringify(response));
  }
});