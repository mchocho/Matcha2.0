const express   = require("express");
const session   = require("express-session");

const dbc       = require("../model/sql_connect.js");
const sql       = require("../model/sql_statements");
const ft_util   = require("../includes/ft_util.js");

const app       = express();
const router    = express.Router();

module.exports  = router;

router.get("/", (req, res) =>
{
  const sess = req.session.user;

  if (!ft_util.isobject(sess))
  {
    res.redirect("/");
    return;
  }
  
  dbc.query(sql.logoutUser, [sess.id], (err, result) =>
  {
    if (err) throw err;
    
    req.session.destroy(() =>
    {
      res.redirect("/");
    });
  });
});
