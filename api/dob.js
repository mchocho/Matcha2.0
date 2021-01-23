const express       = require("express");
const path          = require("path");
const moment        = require("moment");
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

  const dob       = req.body.dob;
  const response  = { key : "DOB" };

  validateDOB(dob);

  function validateDOB(dob)
  {
    if (!moment(dob, "YYYY-MM-DD").isValid())
    {
      console.log("Invalid date");
      res.redirect("/user");

      return;
    }
    else if (!moment(dob).isBefore(moment().subtract(18, "years")))
    {
      console.log("The age you specified is too young.");
      res.redirect("/user");

      return;
    }

    saveNewDOB(dob);
  }

  function saveNewDOB(dob)
  {
    dbc.query(sql.updateUserDOB, [dob, sess.id], (err, result) =>
    {
      if (err) {throw err}

      updateSession(dob);
    });
  }

  function updateSession(dob)
  {
    sess.DOB = dob;

    req.session.save(err =>
    {
      if (err) {throw err}

      res.redirect("/user");
    });
  }
});