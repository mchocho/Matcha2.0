const express   = require("express");
const uuidv4  = require("uuid/v4");
const bcrypt  = require("bcryptjs");

const dbc   = require("../model/sql_connect.js");
const sql   = require("../model/sql_statements");
const email   = require("../includes/mail_client.js");
const msg     = require("../includes/email_templates.js");
const ft_util = require("../includes/ft_util.js");

const redirect  = "/matcha";

let router = express.Router();

module.exports = router;

router.get("/", (req, res) =>
{
  const sess          = req.session.user;
  const userSignedIn  = !!sess;
  const renderOptions = {
    userSignedIn,
    title: "Forgot Password | Cupid's Arrow",
    year: new Date().getFullYear()
  };

  //User already logged in
  if (userSignedIn)
  {
    res.redirect(redirect);
    return;
  }

  res.render("forgot_password", renderOptions);
});

router.post((req, res) =>
{
  const userSignedIn  = !!sess;
  const renderOptions = {
    userSignedIn,
    title: "Confirm Your Password | Cupid's Arrow",
    year: new Date().getFullYear()
  };

  if (!userSignedIn)
  {
    res.redirect(redirect);
    return;
  }

  const token     = uuidv4();
  const url       = "http://localhost:3000/verification/" + token;
  const errs      = [];
  const selValues = [req.body.email];

  // We need to handle white space input and XSS
  if (!req.body.newPassword || !req.body.email || !req.body.confPassword)
  {
    errs.push("Fields can't be empty");
  }

  if (req.body.newPassword !== req.body.confPassword)
  {
    errs.push("Passwords don't match");
  } 
  else if (ft_util.passwdCheck(req.body.newPassword) === false)
  {
    errs.push("Provide a valid password of 5 characters or more, with special cases, uppercase and lowercase letters");
  }

  if (errs.length > 0)
  {
    res.render("forgot_password", {messages: errs});
    return;
  }

  dbc.query(sql.selUserByEmail, selValues, getUserId);

  function getUserId(err, result)
  {
    if (err) {throw err}

    const user = result[0];
    
    if (!user) {
      // This is to throw off people trying to guess emails
      // ie, no email gets sent
      res.render("confirm_passwordchange");
      return;
    }
    checkOldTokens(user);
  }

  function checkOldTokens(user)
  {
    const delValues = [user.id, "password_reset"];
    
    dbc.query(sql.delOldTokens, delValues, (err, result) =>
    {
      if (err) {throw err}
      
      createToken(user);
    });
  }

  function createToken(user)
  {
    const salt      = 10;
    const hash      = bcrypt.hashSync(req.body.newPassword, salt);
    const insValues = [user.id, token, hash, "password_reset"];
    
    dbc.query(sql.insNewPwToken, [insValues], emailResetLink);
  }

  function emailResetLink(err, result)
  {
    if (err) {throw err}

    if (result.affectedRows !== 1)
    {
      console.log("Something went wrong in forgot_password");
      return;
    }

    const emailAddress = user.email;
    const title        = "Password Reset Confirmation";
    const msg          = msg.passwordReset(url)
    
    email.main(emailAddress, title, msg).catch(console.error);
    
    res.render("confirm_passwordchange", renderOptions);
  }
});