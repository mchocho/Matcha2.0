const express = require('express');
const dbc	= require('./model/sql_connect.js');
const sql = require('./model/sql_statements.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	const otherUserId = req.query.otherUserId;
	const roomId = req.query.roomId;

	// Check if user is logged in
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' ) {
		res.end(JSON.stringify({success: false}));
		res.redirect('/logout');
		console.log("chat logged you out");
    return;
	}

	// Here we confirm that the room requested does exsist and that
	// the 2 users requesting to chat are indeed connected
	// incase the get query was altered
	findOtherUserAndRoom();

	function findOtherUserAndRoom() {
		dbc.query(
			sql.joinUserNameAndRoom,
			[sess.id, otherUserId, otherUserId, sess.id,roomId, otherUserId],
			(err, result) => {
				if (err) {throw err}
				if (result.length > 0 && result[0].room_name == roomId) {
					console.log("what?")
					res.render('chat.pug', {
						title: "Your Chat | Cupid's Arrow",
						username: sess.username,
						roomName: roomId,
						otherUserName: result[0].username 
					});
				} else {
					res.redirect('/matcha')
					return ;
				}
				console.log("the things", JSON.stringify(result));
			});
	}
});
