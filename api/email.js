const express       = require("express");
const path          = require("path");
const util          = require("util");

const ft_util       = require("../includes/ft_util.js");
const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements.js");

const router        = express.Router();

module.exports      = router;

router.post("/", (req, res) =>
{
  const sess         = req.session.user;
  const userSignedIn = !!sess;

  if (!userSignedIn)
  {
    res.redirect("/logout");
    return;
  }
  else if (sess.verified !== "T")
  {
    res.redirect("/verify_email");
    return;
  }
  else if (sess.valid !== "T")
  {
    res.redirect("/reported_account");
    return;
  }

  const email     = req.body.email;
  const response  = { key : "email" };

  if (!ft_util.isEmail(email))
  {
    console.log("Please enter an email address.");
    res.redirect("/user");

    return;
  }

  checkIfEmailReserved(email);

  function  checkIfEmailReserved(email)
  {
    //Check if email exists
    dbc.query(sql.selCheckUserEmailExists, [email], (err, result) =>
    {
      if (err) {throw err}

      if (result.length > 0)
      {
        console.log("Email address is reserved.");
        res.redirect("/user");
        
        return;
      }

      saveNewEmailAddress(email);
    });
  }

  function saveNewEmailAddress(email)
  {
    dbc.query(sql.updateEmail, [email, sess.id], (err, result) =>
    {
      if (err) {throw err}

      updateSession(email);
    });
  }

  function updateSession(email)
  {
    sess.email = email;

    req.session.save(err =>
    {
      if (err) {throw err}

      res.redirect("/user");
    });
  }
});