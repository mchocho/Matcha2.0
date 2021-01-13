const express   = require("express");

const ft_util   = require("../includes/ft_util.js");
const dbc       = require("../model/sql_connect.js");

let router      = express.Router();
module.exports  = router;

router.get("/", (req, res) =>
{
  const sess          = req.session.user;
  const userSignedIn  = !!sess;
  const renderOptions = {
    userSignedIn,
    title: "404 | Cupid's Arrow",
    year: new Date().getFullYear()
  };

  if (!userSignedIn)
  {
    res.redirect("/logout");

    return;
  }
  else if (sess.verified !== 'T')
  {
    res.redirect("/verify_email");

    return;
  }
  else if (sess.valid !== 'T')
  {
    res.redirect("/reported_account");

    return;
  }

  Promise.all([
    ft_util.userNotificationStatus(dbc, sess.id),
    ft_util.getUserImages(dbc, sess.id)
  ]).then(values =>
  {
    renderOptions.notifications = values[0].notifications;
    renderOptions.chats         = values[0].chats;
    renderOptions.profile_pic   = values[1][0]

    res.render("404", renderOptions);
  })
  .catch(e =>
  {
    throw (e);
  });
});