const express = require('express');
const dbc	= require('./model/sql_connect.js');
const sql = require('./model/sql_statements.js');
const { render } = require('pug');
const { result } = require('lodash');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	const otherUserId = req.query.otherUserId;
	const roomId = req.query.roomId;

	console.log("KDKDKDKDKDK", sess.id, " ", otherUserId, " ", roomId);
	// Check if user is logged in
	if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' ) {
		res.end(JSON.stringify({success: false}));
		res.redirect('/logout');
		console.log("chat logged you out");
    return;
	}

	findOtherUserAndRoom();
	// confirmChatRoom();

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
					// res.writeHead(200, {"Content-Type": "text/plain"});
					console.log("responding", sess.id, " ", otherUserId, " ", roomId);
					res.redirect('/matcha')
					return ;
				}
				console.log("the things", JSON.stringify(result));
			});
	}

	function confirmChatRoom() {
		dbc.query(sql.confirmChatRoomExists, [sess.id, otherUserId, otherUserId, sess.id, roomId], (err, result) => {
			if (err) {throw err;}
			if (result.length > 0) {
				console.log("what?")
				res.render('chat.pug', {
					title: "Your Chat | Cupid's Arrow",
					username: sess.username,
					roomName: roomId 
				});
			} else {
				// res.writeHead(200, {"Content-Type": "text/plain"});
				console.log("responding", sess.id, " ", otherUserId, " ", roomId);
				res.redirect('/matcha')
				return ;
			}
		});
	}
});
