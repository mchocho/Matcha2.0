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

  const firstname = req.body.first;
  const lastname  = req.body.last;
  const response  = {key : "fullname"};

  console.log("Received message: ", req.body);

  if (!ft_util.isString(firstname, lastname))
  {
      console.log("Please enter your first and last name.");
      res.redirect("/user");

      return;
  }

  const first     = firstname.trim();
  const last      = lastname.trim();

  validateFullnames(first, last);

  function validateFullnames(first, last)
  {
    if (first.length === 0)
    {
      console.log("Please enter your first name");
      res.redirect("/user");

      return;
    }
    else if (last.length === 0)
    {
      console.log("Please enter your last name");
      res.redirect("/user");

      return;
    }

    saveNewFullname(first, last);
  }

  function saveNewFullname(first, last)
  {
    dbc.query(sql.updateUserFullname, [first, last, sess.id], (err, result) =>
    {
      if (err) {throw err}

      console.log(`Successfully updated new name to ${first} ${last}`);
      updateSession(first, last);
    });
  }

  function updateSession(first, last)
  {
    sess.first_name = first;
    sess.last_name  = last;

    req.session.save(err =>
    {
      if (err) {throw err}

      res.redirect("/user");
    });
  }
});