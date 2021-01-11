const express   = require("express");
const router    = express.Router();

module.exports  = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	// console.log(sess);

	res.render('chat.pug', {
		title: "Your Chat | Cupid's Arrow",
		username: sess.username
	});
});
