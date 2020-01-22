let selAllUsers 		= "SELECT * FROM `users`";
let selAllUsersDesc		= "SELECT * FROM `users` ORDER BY `users`.`date_created` DESC";
let selAllOthersDesc 	= "SELECT * FROM `users` WHERE `id` != ? ORDER BY `users`.`date_created` DESC";
let selUserById 		= "SELECT * FROM `users` WHERE `id` = ?";
let selUserByUname 		= "SELECT * FROM `users` WHERE `username` = ?";
let selUserByEmail 		= "SELECT * FROM `users` WHERE `email` = ?";
let findByToken			= "SELECT * FROM `tokens` WHERE `token` = ?";
let setUserVerification	= "UPDATE `users` SET `verified` = ? WHERE `id` = ?";
let updateToken			= "UPDATE `tokens` SET `token` = ? WHERE `id` = ?";
let delTokenRow			= "DELETE FROM `tokens` WHERE `id` = ?";

module.exports = {
	selAllUsers,
	selAllUsersDesc,
	selAllOthersDesc,
	selUserByEmail,
	selUserByUname,
	selUserById,
	findByToken,
	setUserVerification,
	updateToken,
	delTokenRow
}	