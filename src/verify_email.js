const express 		= require("express");
const ft_util		= require("../includes/ft_util.js");

let router = express.Router();

module.exports = router;

router.get("/", (req, res) => {
	const sess = req.session.user;

	//User already logged in
	if (ft_util.isobject(sess))
	{
		res.redirect("/matcha");
		return;
	}

	res.render("verify_email.pug", {errors: []});
})