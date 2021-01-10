// Setup basic express server
const express = require('express');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	res.render('chat.pug', {
		title: "Your Chat | Cupid's Arrow"
  });
});
