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

  const value     = req.body.username;
  const response  = {
      value,
      key         : "username"
  };

  if (!ft_util.isString(value))
  {
    console.log("Please enter a new username");
    res.redirect("/user");

    return;
  }

  const name = value.trim();

  validateUsername();

  function validateUsername()
  {
    if (name.length < 2)
    {
      console.log("Username must be at least 2 characters long");
      res.redirect("/user");

      return;
    }
    checkIfUsernameExists();
  }

  function checkIfUsernameExists()
  {
    //Check if username exists
    dbc.query(sql.selCheckUsernameExists, [name], (err, result) =>
    {
      if (result.length > 0)
      {
        console.log("Username already taken");
        res.redirect("/user");

        return;
      }

      saveNewUsername();
    });
  }

  function saveNewUsername()
  {
    dbc.query(sql.updateUsername, [name, sess.id], (err, result) =>
    {
      if (result.affectedRows !== 1)
      {
        console.log("Please try again");
        res.redirect("/user");

        return;
      }

      updateSession();
    });
  }

  function updateSession()
  {
    sess.username = name;

    req.session.save(err =>
    {
      if (err) {throw err}

      response.result = "Success";
      res.redirect("/user");
    });
  }
});