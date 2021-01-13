const 	  express 		= require('express');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;

	// Check if user is logged in
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' ) {
		res.end(JSON.stringify({success: false}));
		res.redirect('/logout');
		console.log("chat logged you out");
    return;
	}

	res.render('chat.pug', {
		title: "Your Chat | Cupid's Arrow",
		username: sess.username
	});
});