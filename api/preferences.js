const express       = require("express");
const dbc           = require("../model/sql_connect.js");

const router        = express.Router();

module.exports      = router;

router.post("/", (req, res) =>
{
  const sess        = req.session.user;
  const pref        = req.body.value;
  const response    = { key : "preferences" };

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
  else if (pref !== 'M' && pref !== 'F' && pref !== 'B')
  {
      response.result = "Please specify your preferences.";
      res.end(JSON.stringify(response));
      return;
  }

  saveNewPreference(pref);

  function saveNewPreference(pref)
  {
      dbc.query(sql.updateUserPreferences, [pref, sess.id], (err, result) =>
      {
          if (err) {throw err}

          updateSession(pref);
      });
  }

  function updateSession(pref)
  {
      sess.preferences = pref;

      req.session.save(err => {
          if (err) {throw err}

          response.result = "Success";
          res.end(JSON.stringify(response));
      });
  }
});