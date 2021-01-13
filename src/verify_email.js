const express     = require("express");
const ft_util     = require("../includes/ft_util.js");

const router      = express.Router();

module.exports    = router;

router.get("/", (req, res) =>
{
  const sess      = req.session.user;
  const errors    = []

  req.session.destroy(err =>
  {
    if (err) {throw err}

    res.render("verify_email.pug", { errors });
  });
})