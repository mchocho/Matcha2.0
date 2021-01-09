const express       = require("express");
const dbc           = require("../model/sql_connect.js");
const email         = require("../includes/mail_client.js");
const msgTemplates  = require("../includes/email_templates.js");
const sql           = require("../model/sql_statements");

const router        = express.Router();

module.exports      = router;

router.post("*", (req, res, next) =>
{
  const sess        = req.session.user;
  const response    = {};

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

  next();

});

router.post("/add", (req, res) =>
{
  const sess        = req.session.user;
  const value       = req.body.value;   //Lowercase all tags
  const response    = { key : "interest" };

  if (!ft_util.isstring(value))
  {
    response.result = "Please enter an interest.";
    res.end(JSON.stringify(response));
    return;
  }

  const interest = value.trim().toLowerCase();
  
  if (interest.length === 0)
  {
    response.result = "Please enter an interest.";
    res.end(JSON.stringify(response));
    return;
  }

  checkIfTagExists();
  
  function checkIfTagExists()
  {
      //Check if tag already exists
      dbc.query(sql.selCheckTagExists, [interest], (err, result) =>
      {
          if (err) {throw err}

          if (result.length === 0)
              saveNewTag();
          else
              saveUserTag(result[0].id);
      });
  }

  function saveNewTag()
  {
      const insValues = [interest];

      dbc.query(sql.insNewTag, [insValues], (err, result) => {
          if (err) {throw err}

          saveUserTag(result.insertId);
      });
  }

  function saveUserTag(tagId)
  {
      const insValues = [sess.id, tagId];

      dbc.query(sql.insNewUserTag, [insValues], (err, result) => {
          if (err) {throw err}

          response.result = "Success";
          response.value = interest;
          res.end(JSON.stringify(response));
          return;
      });
  }
});

router.post("/delete", (req, res) =>
{
    const sess      = req.session.user;
    const id        = req.body.value;
    const response  = {
        key         : "rm_interest",
        value       : id
    };

    res.writeHead(200, {"Content-Type": "text/plain"});

    //User is logged in, verified, valid, and id is valid
    if (isNaN(id))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const delValues = [sess.id, id];

    //Remove user tag link
    dbc.query(sql.delUserTag, delValues, (err, result) =>
    {
        if (err) {throw err}

        response.result = "Success";
        res.end(JSON.stringify(response));
    });
});