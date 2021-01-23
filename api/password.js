const express       = require("express");
const bcrypt        = require("bcryptjs");
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
  const response     = {key : "username"};

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

  validatePassword();

  function validatePassword()
  {
    const oldpw     = req.body.password;
    const newpw     = req.body.newpw;
    const confirmpw = req.body.confirmpw;

    if (!oldpw)
    {
      console.log("Please enter your current password.");
      res.redirect("/user");

      return;
    }
    else if (!ft_util.passwdCheck(newpw))
    {
      console.log("Please enter a new valid password.");
      res.redirect("/user");
      
      return;
    }
    else if (oldpw === newpw)
    {
      console.log("New password can't be current password");
      res.redirect("/user");

      return;
    }
    else if (confirmpw !== newpw)
    {
      console.log("The passwords you provided don't match.");
      res.redirect("/user");

      return;
    }
    else if (!bcrypt.compareSync(oldpw, sess.password))
    {
      console.log("Incorrect password");
      res.redirect("/user");

      return;
    }

    saveNewPassword(newpw);
  }

  function saveNewPassword(newpw)
  {
    const hash          = bcrypt.hashSync(newpw, ft_util.SALT);
    const updateValue   = [hash, sess.id];

    dbc.query(sql.updatePasswd, updateValue, (err, result) =>
    {
      if (err) {throw err}
      
      if (result.affectedRows !== 1)
      {
        console.log("Please try again");
        res.redirect("/user");

        return;
      }

      updateSession(hash);
    });
      
    function updateSession(hash)
    {
      sess.password = hash;

      req.session.save(err =>
      {
        if (err) {throw err}

        res.redirect("/user");
      });
    }
  }
});