let selAllUsers 			= "SELECT * FROM `users`";
let selAllUsersDesc			= "SELECT * FROM `users` ORDER BY `users`.`date_created` DESC";
let selAllOthersDesc 		= "SELECT * FROM `users` WHERE `id` != ? ORDER BY `users`.`date_created` DESC";
let selUserById 			= "SELECT * FROM `users` WHERE `id` = ?";
let selUserByUname 			= "SELECT * FROM `users` WHERE `username` = ?";
let selUserByEmail 			= "SELECT * FROM `users` WHERE `email` = ?";
let findByToken				= "SELECT * FROM `tokens` WHERE `token` = ?";
let setUserVerification		= "UPDATE `users` SET `verified` = ? WHERE `id` = ?";
let updateToken				= "UPDATE `tokens` SET `token` = ? WHERE `id` = ?";
let delTokenRow				= "DELETE FROM `tokens` WHERE `id` = ?";
let selUserIdByEmail		= "SELECT `id` FROM `users` WHERE email = ?";
let insNewPwToken			= "INSERT INTO `tokens` " +
							  " (`user_id`, `token`, `new_password`,`request`) " +
							  " VALUES (?, ?, ?, ?)";
let updatePasswd			= "UPDATE `users` SET `password` = ? WHERE `id` = ?";
let delOldTokens			= "DELETE FROM `tokens` WHERE `user_id` = ? && `request` = ?";
let insUserLocation			= "INSERT INTO locations (lat, lng, street_address, area, state, country, user_id) VALUES (?)";
let updateUserLocation		= "UPDATE locations SET lat = ?, lng = ?, street_address = ?, area = ?, state = ?, country = ? WHERE user_id = ?";
let selTagName				= "SELECT name FROM tags WHERE id = ?";
let insNewRegistrationToken	= "INSERT INTO tokens (user_id, token, request) VALUES ?";
let getConnectionStatus		= "SELECT * FROM likes WHERE (liker = ? AND liked = ?) OR (liker = ? AND liked = ?)";

module.exports = {
	selAllUsers, selAllUsersDesc,
	selAllOthersDesc, selUserByEmail,
	selUserByUname, selUserById,
	findByToken, setUserVerification,
	updateToken, delTokenRow,
	selUserIdByEmail, insNewPwToken,
	updateToken, updatePasswd,
	delOldTokens,
	insUserLocation, updateUserLocation,
	selTagName
}	