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

  const bio      = req.body.bio;
  const response = { key : "biography" };

  // res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

  //User is logged in and bio is valid
  if (!ft_util.isString(bio))
  {
    console.log("Please enter something about yourself.");
    res.redirect("/user");

    return;
  }

  validateBio(bio);

  function validateBio(bio)
  {
    if (bio.length > 3500) //Max chars is 4000
    {
      console.log("Please enter something about yourself.");
      res.redirect("/user");

      return;
    }

    saveNewBio(bio);
  }

  function saveNewBio(bio)
  {
    dbc.query(sql.updateUserBio, [bio, sess.id], (err, result) =>
    {
      if (err) {throw err}

      updateSession(bio);
    });
  }

  function updateSession(bio)
  {
    sess.biography = bio;

    req.session.save(err =>
    {
      if (err) {throw err}

      res.redirect("/user");
    });     
  }
});