
module.exports = {
	selAllUsers 			: "SELECT * FROM `users`",
	selAllUserIds			: "SELECT id FROM `users`",
	selAllUsersDesc			: "SELECT * FROM `users` ORDER BY `users`.`date_created` DESC",
	selAllOthersDesc 		: "SELECT * FROM `users` WHERE `id` != ? ORDER BY `users`.`date_created` DESC",
	selUserById 			: "SELECT * FROM `users` WHERE `id` = ?",
	selUserByUname 			: "SELECT * FROM `users` WHERE `username` = ?",
	selUserByEmail 			: "SELECT * FROM `users` WHERE `email` = ?",
	findByToken				: "SELECT * FROM `tokens` WHERE `token` = ?",
	setUserVerification		: "UPDATE `users` SET `verified` = ? WHERE `id` = ?",
	updateToken				: "UPDATE `tokens` SET `token` = ? WHERE `id` = ?",
	delTokenRow				: "DELETE FROM `tokens` WHERE `id` = ?",
	selUserIdByEmail		: "SELECT `id` FROM `users` WHERE email = ?",
	selUserEmail 			: "SELECT email FROM users WHERE id = ?",
	insNewPwToken			: "INSERT INTO `tokens` " +
							" (`user_id`, `token`, `new_password`,`request`) " +
							" VALUES (?, ?, ?, ?)",
	updatePasswd			: "UPDATE `users` SET `password` = ? WHERE `id` = ?",
	delOldTokens			: "DELETE FROM `tokens` WHERE `user_id` = ? && `request` = ?",
	selUserLocation			: "SELECT * FROM `locations` WHERE `user_id` = ?",
	selBlockedUsers			: "SELECT `blocked_user` FROM `blocked_accounts` WHERE `user_id` = ?",
	selAllMale				: "SELECT * FROM users " + 
							"WHERE gender = 'M' " +
							"AND (preferences = ? OR preferences = 'B') " + 
							"AND verified = 'T' " + 
							"AND NOT id = ?",
	selAllFemale			: "SELECT * FROM users " + 
							"WHERE gender = 'F' " +
							"AND (preferences = ? OR preferences = 'B') " + 
							"AND verified = 'T' " + 
							"AND NOT id = ?",
	selAllBoth				: "SELECT * FROM users " + 
							"WHERE (preferences = ? OR preferences = 'B') " + 
							"AND verified = 'T' " + 
							"AND NOT id = ?",
	selImagePath			: "SELECT `name` FROM `images` " + 
							"WHERE `user_id` = ? AND profile_pic = 'T'",
	selUserImages			: "SELECT * from images WHERE user_id = ?",
	insUserLocation			: "INSERT INTO locations (lat, lng, street_address, area, state, country, user_id) VALUES (?)",
	updateUserLocation		: "UPDATE locations SET lat = ?, lng = ?, street_address = ?, area = ?, state = ?, country = ? WHERE user_id = ?",
	selUserTags				: "SELECT * from user_tags WHERE user_id = ?",
	selTagName				: "SELECT name FROM tags WHERE id = ?",
	insNewRegToken			: "INSERT INTO tokens (user_id, token, request) VALUES ?",
	getConnectionStatus		: "SELECT * FROM likes WHERE (liker = ? AND liked = ? AND unliked = 'F') OR (liker = ? AND liked = ? AND unliked = 'F')",
	reportUser				: "UPDATE users SET valid = 'F' WHERE id = ?",
	selBlockedUser 	   		: "SELECT id FROM `blocked_accounts` WHERE `user_id` = ? AND `blocked_user` = ?",
	insBlockedUser			: "INSERT INTO `blocked_accounts` (user_id, blocked_user) VALUES (?)",
	delBlockedUser			: "DELETE FROM `blocked_accounts` WHERE `user_id` = ? AND `blocked_user` = ?",
	updateFameRating		: "UPDATE `users` SET `rating` = ? WHERE `id` = ?",
	insNewView				: "INSERT INTO views (user_id, viewer) VALUES (?)",
	insNewNotification		: "INSERT INTO notifications (user_id, service_id, type) VALUES (?)",
	getUserLikes			: "SELECT id FROM likes WHERE liked = ? AND unliked = 'F'",
	checkUserLikeExists		: "SELECT id FROM likes WHERE `liker` = ? AND `liked` = ? AND unliked = 'F'",
	unlikeUser				: "UPDATE `likes` SET `unliked` = 'T' WHERE `liker` = ? AND `liked` = ?",
	likeUnlikedUser			: "UPDATE `likes` SET `unliked` = 'F' WHERE `liker` = ? AND `liked` = ?",
	delLike 				: "DELETE FROM likes WHERE `liker` = ? AND `liked` = ?",
	insLike					: "INSERT INTO likes (liker, liked) VALUES (?)",
	selUserNotifications	: "SELECT * FROM notifications WHERE user_id = ?",
	checkNotifications		: "SELECT id FROM notifications WHERE user_id = ? AND viewed = 'F' LIMIT 1",
	checkChats				: "SELECT id FROM chat_notifications WHERE user_id = ? AND viewed = 'F' LIMIT 1",
	selUserLike				: "SELECT * FROM likes WHERE id = ?",
	selUserView				: "SELECT viewer FROM views WHERE id = ?"
}