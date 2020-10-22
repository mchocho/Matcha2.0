
module.exports = {
	selAllUsers 			: "SELECT * FROM `users`",
	selAllUserIds			: "SELECT id FROM `users`",
	selAllUsersDesc			: "SELECT * FROM `users` ORDER BY `users`.`date_created` DESC",
	selAllOthersDesc 		: "SELECT * FROM `users` WHERE `id` != ? ORDER BY `users`.`date_created` DESC",
	selUserById 			: "SELECT * FROM `users` WHERE `id` = ?",
	selUserByUname 			: "SELECT * FROM `users` WHERE `username` = ?",
	selUserByEmail 			: "SELECT * FROM `users` WHERE `email` = ?",
	selUserByAuth 			: "SELECT * FROM `users` WHERE (`username` = ? OR `email` = ?)",
	selCheckUsernameExists	: "SELECT `id` FROM `users` WHERE (`username` = ?) LIMIT 1",
	selCheckUserEmailExists	: "SELECT `id` FROM `users` WHERE `email` = ?",
	insNewUser 				: "INSERT INTO `users` (`username`, `first_name`, `last_name`, `gender`, `preferences`, `DOB`, `email`, `password`) VALUES (?)",
	insNewToken 			: "INSERT INTO `tokens` (`user_id`, `token`,`request`) VALUES (?)",
	findByToken				: "SELECT * FROM `tokens` WHERE `token` = ?",
	setUserVerification		: "UPDATE `users` SET `verified` = ? WHERE `id` = ?",
	updateToken				: "UPDATE `tokens` SET `token` = ? WHERE `id` = ?",
	delTokenRow				: "DELETE FROM `tokens` WHERE `id` = ?",
	selUserEmail 			: "SELECT `email` FROM `users` WHERE `id` = ?",
	updateUsername			: "UPDATE `users` SET `username` = ? WHERE `id` = ?",
	updateEmail				: "UPDATE `users` SET `email` = ? WHERE `id` = ?",
	insNewPwToken			: "INSERT INTO `tokens` " +
							" (`user_id`, `token`, `new_password`,`request`) " +
							" VALUES (?, ?, ?, ?)",
	updatePasswd			: "UPDATE `users` SET `password` = ? WHERE `id` = ?",
	delOldTokens			: "DELETE FROM `tokens` WHERE `user_id` = ? && `request` = ?",
	selUserLocation			: "SELECT * FROM `locations` WHERE `user_id` = ?",
	selUserLocationId		: "SELECT `id` FROM `locations` WHERE user_id = ?",
	selBlockedUser 	   		: "SELECT `id` FROM `blocked_accounts` WHERE `user_id` = ? AND `blocked_user` = ?",
	selBlockedUsers			: "SELECT `blocked_user` FROM `blocked_accounts` WHERE `user_id` = ?",
	selBlockedUserById 		: "SELECT * FROM `blocked_accounts` WHERE `id` = ?",
	insBlockedUser			: "INSERT INTO `blocked_accounts` (user_id, blocked_user) VALUES (?)",
	delBlockedUser			: "DELETE FROM `blocked_accounts` WHERE `user_id` = ? AND `blocked_user` = ?",
	selAllMale				: "SELECT * FROM `users` " + 
							"WHERE `gender` = 'M' " +
							"AND (`preferences` = ? OR `preferences` = 'B') " + 
							"AND `verified` = 'T' " + 
							"AND NOT id = ?",
	selAllFemale			: "SELECT * FROM `users` " + 
							"WHERE `gender` = 'F' " +
							"AND (`preferences` = ? OR `preferences` = 'B') " + 
							"AND `verified` = 'T' " + 
							"AND NOT `id` = ?",
	selAllBoth				: "SELECT * FROM `users` " + 
							"WHERE (`preferences` = ? OR `preferences` = 'B') " + 
							"AND `verified` = 'T' " + 
							"AND NOT `id` = ?",
	selImagePath			: "SELECT `name` FROM `images` " + 
							"WHERE `user_id` = ? AND profile_pic = 'T'",
	selUserImages			: "SELECT * from `images` WHERE `user_id` = ?",
	delUserImages			: "DELETE FROM `images` WHERE `user_id` = ?",
	insImage				: "INSERT INTO `images` (`name`, `user_id`, `profile_pic` = 'T') VALUES (?)",
	insUserLocation			: "INSERT INTO locations (lat, lng, street_address, area, state, country, user_id) VALUES (?)",
	updateUserLocation		: "UPDATE locations SET lat = ?, lng = ?, street_address = ?, area = ?, state = ?, country = ? WHERE user_id = ?",
	selUserTags				: "SELECT * from `user_tags` WHERE `user_id` = ?",
	insNewUserTag			: "INSERT INTO `user_tags`(`user_id`, `tag_id`) VALUES (?) ",
	delUserTag				: "DELETE FROM user_tags WHERE user_id = ? AND tag_id = ?",
	insNewTag 				: "INSERT INTO `tags` (`name`) VALUES (?)",
	selTagName				: "SELECT `name` FROM `tags` WHERE `id` = ?",
	selCheckTagExists 		: "SELECT `id` FROM `tags` WHERE `name` = ? LIMIT 1",
	insNewRegToken			: "INSERT INTO `tokens` (`user_id`, `token`, `request`) VALUES ?",
	getConnectionStatus		: "SELECT * FROM `likes` WHERE (liker = ? AND liked = ? AND unliked = 'F') OR (liker = ? AND liked = ? AND unliked = 'F')",
	reportUser				: "UPDATE `users` SET `valid` = 'F' WHERE `id` = ?",
	updateFameRating		: "UPDATE `users` SET `rating` = ? WHERE `id` = ?",
	insNewView				: "INSERT INTO `views` (`user_id`, `viewer`) VALUES (?)",
	insNewNotification		: "INSERT INTO `notifications` (`user_id`, `service_id`, `type`) VALUES (?)",
	getUserLikes			: "SELECT `id` FROM `likes` WHERE `liked` = ? AND `unliked` = 'F'",
	checkIfUserLikesSomeone	: "SELECT `id` FROM `likes` WHERE `liker` = ? AND `liked` = ? AND unliked = 'F'",
	unlikeUser				: "UPDATE `likes` SET `unliked` = 'T' WHERE `liker` = ? AND `liked` = ?",
	likeUnlikedUser			: "UPDATE `likes` SET `unliked` = 'F' WHERE `liker` = ? AND `liked` = ?",
	delLike 				: "DELETE FROM `likes` WHERE `liker` = ? AND `liked` = ?",
	insLike					: "INSERT INTO `likes` (`liker`, `liked`) VALUES (?)",
	selUserNotifications	: "SELECT * FROM `notifications` WHERE `user_id` = ?",
	checkNotifications		: "SELECT `id` FROM `notifications` WHERE `user_id` = ? AND `viewed` = 'F' LIMIT 1",
	updateUserNotifications : "UPDATE `notifications` SET `viewed` = 'T' WHERE `user_id` = ? AND `viewed` = 'F'",
	checkChats				: "SELECT `id` FROM `chat_notifications` WHERE `user_id` = ? AND `viewed` = 'F' LIMIT 1",
	selUserLike				: "SELECT * FROM `likes` WHERE `id` = ?",
	selUserView				: "SELECT `viewer` FROM `views` WHERE id = ?",
	selUserBlacklist		: "SELECT `blocked_user` FROM `blocked_accounts` WHERE `user_id` = ?",
	logoutUser				: "UPDATE `users` SET `online` = 'F' WHERE `id` = ?",
	selUserViews			: "SELECT `id` FROM `views` WHERE `user_id` = ?",
	updateUserDOB			: "UPDATE `users` SET `DOB` = ? WHERE `id` = ?",
	updateUserPreferences 	: "UPDATE `users` SET `preferences` = ? WHERE `id` = ?",
	updateUserGender		: "UPDATE `users` SET `gender` = ? WHERE `id` = ?",
	updateUserFullname		: "UPDATE `users` SET `first_name` = ?, `last_name` = ? WHERE `id` = ?",
	updateUserBio 			: "UPDATE `users` SET `biography` = ? WHERE `id` = ?"
}